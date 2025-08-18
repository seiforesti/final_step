"""
Event Service - Production-grade Event Bus Facade
Supports Kafka and Redis backends with safe fallbacks and health checks.

Configuration via environment variables:
- EVENT_BUS_DRIVER: kafka | redis | memory (default: memory)
- EVENT_DEFAULT_TOPIC: default topic/channel when none provided

Kafka:
- KAFKA_BOOTSTRAP_SERVERS (e.g., "kafka:9092")
- KAFKA_CLIENT_ID
- KAFKA_SECURITY_PROTOCOL, KAFKA_SASL_MECHANISM, KAFKA_SASL_USERNAME, KAFKA_SASL_PASSWORD

Redis:
- REDIS_URL (e.g., "redis://redis:6379/0") or REDIS_HOST, REDIS_PORT, REDIS_DB
"""

from typing import Any, Dict, Optional, List
from datetime import datetime
import os
import json
import asyncio
import logging

logger = logging.getLogger(__name__)


class EventService:
	"""Enterprise event bus facade with Kafka/Redis backends and memory fallback."""

	def __init__(self) -> None:
		self.driver = (os.environ.get("EVENT_BUS_DRIVER", "memory").strip().lower())
		self.default_topic = os.environ.get("EVENT_DEFAULT_TOPIC", "datagov.events")
		self._kafka_producer = None
		self._redis_client = None
		self._lock = asyncio.Lock()

	async def publish(self, topic: Optional[str], event: Dict[str, Any], key: Optional[str] = None, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
		"""Publish a single event to the configured bus.

		Returns an ACK dict with backend metadata or a fallback ACK in memory mode.
		"""
		topic = topic or self.default_topic
		payload = self._encode_event(event, headers=headers)
		try:
			if self.driver == "kafka":
				return await self._publish_kafka(topic, payload, key)
			elif self.driver == "redis":
				return await self._publish_redis(topic, payload)
			else:
				# Memory fallback
				return {
					"ack": True,
					"driver": "memory",
					"topic": topic,
					"timestamp": datetime.utcnow().isoformat(),
				}
		except Exception as e:
			logger.error(f"Event publish failed (driver={self.driver}): {e}")
			return {
				"ack": False,
				"driver": self.driver,
				"topic": topic,
				"error": str(e),
				"timestamp": datetime.utcnow().isoformat(),
			}

	async def publish_batch(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
		"""Publish a batch of events. Each record: {topic?, event, key?, headers?}."""
		acks: List[Dict[str, Any]] = []
		for rec in records:
			ack = await self.publish(
				rec.get("topic"),
				rec.get("event", {}),
				key=rec.get("key"),
				headers=rec.get("headers"),
			)
			acks.append(ack)
		return {
			"count": len(acks),
			"success": sum(1 for a in acks if a.get("ack")) == len(acks),
			"acks": acks,
		}

	async def health(self) -> Dict[str, Any]:
		"""Return backend health information without raising."""
		info: Dict[str, Any] = {"driver": self.driver, "healthy": True}
		try:
			if self.driver == "kafka":
				prod = await self._ensure_kafka()
				info.update({"kafka_ready": bool(prod is not None)})
			elif self.driver == "redis":
				client = await self._ensure_redis()
				pong = await client.ping() if client else False
				info.update({"redis_ready": bool(pong)})
		except Exception as e:
			info.update({"healthy": False, "error": str(e)})
		return info

	def _encode_event(self, event: Dict[str, Any], headers: Optional[Dict[str, str]] = None) -> bytes:
		"""Serialize event with metadata to bytes (UTF-8 JSON)."""
		envelope = {
			"event": event or {},
			"meta": {
				"emitted_at": datetime.utcnow().isoformat(),
				"headers": headers or {},
			},
		}
		return json.dumps(envelope, default=str).encode("utf-8")

	async def _publish_kafka(self, topic: str, payload: bytes, key: Optional[str]) -> Dict[str, Any]:
		producer = await self._ensure_kafka()
		if producer is None:
			raise RuntimeError("Kafka producer not available")
		ack: Dict[str, Any] = {"ack": False, "driver": "kafka", "topic": topic}
		# Support kafka-python and confluent-kafka producers
		if self._kafka_backend == "kafka_python":
			# kafka-python is synchronous, use thread to avoid blocking loop
			from kafka.errors import KafkaError  # type: ignore
			def _send_sync() -> Dict[str, Any]:
				future = producer.send(topic, value=payload, key=(key.encode("utf-8") if key else None))
				metadata = future.get(timeout=10)
				return {
					"ack": True,
					"partition": metadata.partition,
					"offset": metadata.offset,
				}
			try:
				meta = await asyncio.to_thread(_send_sync)
				ack.update(meta)
			except KafkaError as e:  # pragma: no cover
				raise RuntimeError(str(e))
		elif self._kafka_backend == "confluent_kafka":
			from confluent_kafka import KafkaError as CKafkaError  # type: ignore
			loop = asyncio.get_running_loop()
			future: asyncio.Future = loop.create_future()
			def delivery(err, msg):
				if err is not None:
					loop.call_soon_threadsafe(future.set_exception, RuntimeError(str(err)))
				else:
					loop.call_soon_threadsafe(future.set_result, {"partition": msg.partition(), "offset": msg.offset()})
			producer.produce(topic, value=payload, key=(key.encode("utf-8") if key else None), callback=delivery)
			producer.poll(0)  # trigger delivery
			meta = await asyncio.wait_for(future, timeout=10)
			ack.update({"ack": True, **meta})
		else:  # pragma: no cover
			raise RuntimeError("Unknown Kafka backend")
		return ack

	async def _ensure_kafka(self):
		if self._kafka_producer is not None:
			return self._kafka_producer
		async with self._lock:
			if self._kafka_producer is not None:
				return self._kafka_producer
			# Try kafka-python first, then confluent-kafka
			bootstrap = os.environ.get("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
			client_id = os.environ.get("KAFKA_CLIENT_ID", "datagov-backend")
			# kafka-python
			try:
				from kafka import KafkaProducer  # type: ignore
				self._kafka_backend = "kafka_python"
				self._kafka_producer = KafkaProducer(
					bootstrap_servers=bootstrap.split(","),
					client_id=client_id,
					retries=3,
					linger_ms=5,
					acks="all",
				)
				logger.info("Initialized kafka-python producer")
				return self._kafka_producer
			except Exception as e:
				logger.debug(f"kafka-python unavailable: {e}")
			# confluent-kafka
			try:
				from confluent_kafka import Producer  # type: ignore
				conf = {
					"bootstrap.servers": bootstrap,
					"client.id": client_id,
				}
				sec = os.environ.get("KAFKA_SECURITY_PROTOCOL")
				if sec:
					conf["security.protocol"] = sec
					mech = os.environ.get("KAFKA_SASL_MECHANISM")
					if mech:
						conf["sasl.mechanism"] = mech
						conf["sasl.username"] = os.environ.get("KAFKA_SASL_USERNAME", "")
						conf["sasl.password"] = os.environ.get("KAFKA_SASL_PASSWORD", "")
				self._kafka_backend = "confluent_kafka"
				self._kafka_producer = Producer(conf)
				logger.info("Initialized confluent-kafka producer")
				return self._kafka_producer
			except Exception as e:
				logger.warning(f"Kafka producer initialization failed: {e}")
				self._kafka_producer = None
				return None

	async def _publish_redis(self, channel: str, payload: bytes) -> Dict[str, Any]:
		client = await self._ensure_redis()
		if client is None:
			raise RuntimeError("Redis client not available")
		count = await client.publish(channel, payload)
		return {
			"ack": True,
			"driver": "redis",
			"channel": channel,
			"delivered": int(count),
		}

	async def _ensure_redis(self):
		if self._redis_client is not None:
			return self._redis_client
		async with self._lock:
			if self._redis_client is not None:
				return self._redis_client
			try:
				import redis.asyncio as redis  # type: ignore
				url = os.environ.get("REDIS_URL")
				if url:
					self._redis_client = redis.from_url(url)
				else:
					host = os.environ.get("REDIS_HOST", "localhost")
					port = int(os.environ.get("REDIS_PORT", 6379))
					db = int(os.environ.get("REDIS_DB", 0))
					self._redis_client = redis.Redis(host=host, port=port, db=db)
				logger.info("Initialized Redis client for event bus")
				return self._redis_client
			except Exception as e:
				logger.warning(f"Redis client initialization failed: {e}")
				self._redis_client = None
				return None
