from typing import Optional, Dict, Any, Union
import logging
import os
import json
from abc import ABC, abstractmethod

# For HashiCorp Vault
try:
    import hvac
    VAULT_AVAILABLE = True
except ImportError:
    VAULT_AVAILABLE = False

# For AWS Secrets Manager
try:
    import boto3
    from botocore.exceptions import ClientError
    AWS_SM_AVAILABLE = True
except ImportError:
    AWS_SM_AVAILABLE = False

# For Azure Key Vault
try:
    from azure.identity import DefaultAzureCredential
    from azure.keyvault.secrets import SecretClient
    AZURE_KV_AVAILABLE = True
except ImportError:
    AZURE_KV_AVAILABLE = False

# Setup logging
logger = logging.getLogger(__name__)


class SecretManagerBase(ABC):
    """Base class for secret managers."""
    
    @abstractmethod
    def get_secret(self, secret_name: str) -> Optional[str]:
        """Get a secret by name."""
        pass
    
    @abstractmethod
    def set_secret(self, secret_name: str, secret_value: str) -> bool:
        """Set a secret value."""
        pass
    
    @abstractmethod
    def delete_secret(self, secret_name: str) -> bool:
        """Delete a secret."""
        pass


class LocalSecretManager(SecretManagerBase):
    """Local secret manager that stores secrets in environment variables or a local file.
    This is primarily for development and testing purposes.
    """
    
    def __init__(self, secrets_file: Optional[str] = None):
        """Initialize the local secret manager.
        
        Args:
            secrets_file: Path to a JSON file containing secrets. If None, uses environment variables.
        """
        self.secrets_file = secrets_file
        self.secrets = {}
        
        if secrets_file and os.path.exists(secrets_file):
            try:
                with open(secrets_file, 'r') as f:
                    self.secrets = json.load(f)
            except Exception as e:
                logger.error(f"Error loading secrets file: {str(e)}")
    
    def get_secret(self, secret_name: str) -> Optional[str]:
        """Get a secret from environment variables or the secrets file."""
        # First check environment variables
        env_value = os.environ.get(secret_name)
        if env_value:
            return env_value
        
        # Then check the secrets file
        return self.secrets.get(secret_name)
    
    def set_secret(self, secret_name: str, secret_value: str) -> bool:
        """Set a secret persistently when possible; otherwise use in-memory/env fallback."""
        # Always update in-memory cache so the running process can read it back
        self.secrets[secret_name] = secret_value
        
        # If a secrets file is configured, persist to disk
        if self.secrets_file:
            try:
                with open(self.secrets_file, 'w') as f:
                    json.dump(self.secrets, f, indent=2)
                return True
            except Exception as e:
                logger.error(f"Error saving secret to file: {str(e)}")
                # Fall through to env fallback
        
        # Fallback: set as environment variable for this process (non-persistent across restarts)
        try:
            os.environ[secret_name] = secret_value
        except Exception as e:
            logger.error(f"Error setting secret in environment: {str(e)}")
            # Still return True since in-memory cache holds the value
        return True
    
    def delete_secret(self, secret_name: str) -> bool:
        """Delete a secret from the configured store or in-memory/env fallback."""
        # Remove from in-memory cache
        removed = False
        if secret_name in self.secrets:
            del self.secrets[secret_name]
            removed = True
        
        # If file persistence is configured, rewrite the file
        if self.secrets_file:
            try:
                with open(self.secrets_file, 'w') as f:
                    json.dump(self.secrets, f, indent=2)
                removed = True
            except Exception as e:
                logger.error(f"Error saving secrets file after deletion: {str(e)}")
        
        # Best-effort: also clear environment variable
        try:
            if secret_name in os.environ:
                os.environ.pop(secret_name, None)
                removed = True
        except Exception:
            pass
        
        return removed


class HashiCorpVaultManager(SecretManagerBase):
    """Secret manager that uses HashiCorp Vault."""
    
    def __init__(self, url: str, token: Optional[str] = None, role_id: Optional[str] = None, 
                 secret_id: Optional[str] = None, mount_point: str = 'secret'):
        """Initialize the HashiCorp Vault manager.
        
        Args:
            url: Vault server URL
            token: Vault token (if using token auth)
            role_id: AppRole role ID (if using AppRole auth)
            secret_id: AppRole secret ID (if using AppRole auth)
            mount_point: Secret engine mount point
        """
        if not VAULT_AVAILABLE:
            raise ImportError("hvac package is required for HashiCorp Vault integration")
        
        self.mount_point = mount_point
        
        # Initialize Vault client
        self.client = hvac.Client(url=url)
        
        # Authenticate
        if token:
            self.client.token = token
        elif role_id and secret_id:
            self.client.auth.approle.login(role_id=role_id, secret_id=secret_id)
        else:
            raise ValueError("Either token or role_id and secret_id must be provided")
        
        if not self.client.is_authenticated():
            raise ValueError("Failed to authenticate with Vault")
    
    def get_secret(self, secret_name: str) -> Optional[str]:
        """Get a secret from Vault."""
        try:
            # Split path and key
            path_parts = secret_name.rsplit('/', 1)
            if len(path_parts) == 2:
                path, key = path_parts
            else:
                path = 'data'
                key = secret_name
            
            # Read secret
            secret = self.client.secrets.kv.v2.read_secret_version(
                path=path, mount_point=self.mount_point
            )
            
            return secret['data']['data'].get(key)
        except Exception as e:
            logger.error(f"Error retrieving secret from Vault: {str(e)}")
            return None
    
    def set_secret(self, secret_name: str, secret_value: str) -> bool:
        """Set a secret in Vault."""
        try:
            # Split path and key
            path_parts = secret_name.rsplit('/', 1)
            if len(path_parts) == 2:
                path, key = path_parts
            else:
                path = 'data'
                key = secret_name
            
            # Create or update secret
            self.client.secrets.kv.v2.create_or_update_secret(
                path=path,
                secret={key: secret_value},
                mount_point=self.mount_point
            )
            return True
        except Exception as e:
            logger.error(f"Error setting secret in Vault: {str(e)}")
            return False
    
    def delete_secret(self, secret_name: str) -> bool:
        """Delete a secret from Vault."""
        try:
            # Split path and key
            path_parts = secret_name.rsplit('/', 1)
            if len(path_parts) == 2:
                path, key = path_parts
            else:
                path = 'data'
                key = secret_name
            
            # Delete secret
            self.client.secrets.kv.v2.delete_metadata_and_all_versions(
                path=path,
                mount_point=self.mount_point
            )
            return True
        except Exception as e:
            logger.error(f"Error deleting secret from Vault: {str(e)}")
            return False


class AWSSecretsManager(SecretManagerBase):
    """Secret manager that uses AWS Secrets Manager."""
    
    def __init__(self, region_name: str = 'us-east-1', **kwargs):
        """Initialize the AWS Secrets Manager.
        
        Args:
            region_name: AWS region name
            **kwargs: Additional arguments to pass to boto3.client
        """
        if not AWS_SM_AVAILABLE:
            raise ImportError("boto3 package is required for AWS Secrets Manager integration")
        
        self.client = boto3.client(
            service_name='secretsmanager',
            region_name=region_name,
            **kwargs
        )
    
    def get_secret(self, secret_name: str) -> Optional[str]:
        """Get a secret from AWS Secrets Manager."""
        try:
            response = self.client.get_secret_value(SecretId=secret_name)
            if 'SecretString' in response:
                return response['SecretString']
            return None
        except ClientError as e:
            logger.error(f"Error retrieving secret from AWS Secrets Manager: {str(e)}")
            return None
    
    def set_secret(self, secret_name: str, secret_value: str) -> bool:
        """Set a secret in AWS Secrets Manager."""
        try:
            # Check if secret exists
            try:
                self.client.describe_secret(SecretId=secret_name)
                # Secret exists, update it
                self.client.update_secret(
                    SecretId=secret_name,
                    SecretString=secret_value
                )
            except ClientError:
                # Secret doesn't exist, create it
                self.client.create_secret(
                    Name=secret_name,
                    SecretString=secret_value
                )
            return True
        except ClientError as e:
            logger.error(f"Error setting secret in AWS Secrets Manager: {str(e)}")
            return False
    
    def delete_secret(self, secret_name: str) -> bool:
        """Delete a secret from AWS Secrets Manager."""
        try:
            self.client.delete_secret(
                SecretId=secret_name,
                ForceDeleteWithoutRecovery=True
            )
            return True
        except ClientError as e:
            logger.error(f"Error deleting secret from AWS Secrets Manager: {str(e)}")
            return False


class AzureKeyVaultManager(SecretManagerBase):
    """Secret manager that uses Azure Key Vault."""
    
    def __init__(self, vault_url: str):
        """Initialize the Azure Key Vault manager.
        
        Args:
            vault_url: Azure Key Vault URL
        """
        if not AZURE_KV_AVAILABLE:
            raise ImportError("azure-identity and azure-keyvault-secrets packages are required for Azure Key Vault integration")
        
        # Create a credential using DefaultAzureCredential
        credential = DefaultAzureCredential()
        
        # Create a secret client
        self.client = SecretClient(vault_url=vault_url, credential=credential)
    
    def get_secret(self, secret_name: str) -> Optional[str]:
        """Get a secret from Azure Key Vault."""
        try:
            secret = self.client.get_secret(secret_name)
            return secret.value
        except Exception as e:
            logger.error(f"Error retrieving secret from Azure Key Vault: {str(e)}")
            return None
    
    def set_secret(self, secret_name: str, secret_value: str) -> bool:
        """Set a secret in Azure Key Vault."""
        try:
            self.client.set_secret(secret_name, secret_value)
            return True
        except Exception as e:
            logger.error(f"Error setting secret in Azure Key Vault: {str(e)}")
            return False
    
    def delete_secret(self, secret_name: str) -> bool:
        """Delete a secret from Azure Key Vault."""
        try:
            delete_operation = self.client.begin_delete_secret(secret_name)
            delete_operation.wait()
            return True
        except Exception as e:
            logger.error(f"Error deleting secret from Azure Key Vault: {str(e)}")
            return False


class SecretManagerFactory:
    """Factory for creating secret managers."""
    
    @staticmethod
    def create_secret_manager(manager_type: str, **kwargs) -> SecretManagerBase:
        """Create a secret manager of the specified type.
        
        Args:
            manager_type: Type of secret manager ('local', 'vault', 'aws', 'azure')
            **kwargs: Additional arguments to pass to the secret manager constructor
        
        Returns:
            A secret manager instance
        """
        if manager_type == 'local':
            return LocalSecretManager(**kwargs)
        elif manager_type == 'vault':
            return HashiCorpVaultManager(**kwargs)
        elif manager_type == 'aws':
            return AWSSecretsManager(**kwargs)
        elif manager_type == 'azure':
            return AzureKeyVaultManager(**kwargs)
        else:
            raise ValueError(f"Unsupported secret manager type: {manager_type}")


# Global secret manager instance
_secret_manager = None


def get_secret_manager() -> SecretManagerBase:
    """Get the global secret manager instance."""
    global _secret_manager
    
    if _secret_manager is None:
        # Initialize from environment variables or configuration
        manager_type = os.environ.get('SECRET_MANAGER_TYPE', 'local')
        
        if manager_type == 'local':
            secrets_file = os.environ.get('SECRETS_FILE')
            _secret_manager = LocalSecretManager(secrets_file=secrets_file)
        elif manager_type == 'vault':
            vault_url = os.environ.get('VAULT_URL')
            vault_token = os.environ.get('VAULT_TOKEN')
            vault_role_id = os.environ.get('VAULT_ROLE_ID')
            vault_secret_id = os.environ.get('VAULT_SECRET_ID')
            vault_mount_point = os.environ.get('VAULT_MOUNT_POINT', 'secret')
            
            if not vault_url:
                raise ValueError("VAULT_URL environment variable is required for Vault integration")
            
            _secret_manager = HashiCorpVaultManager(
                url=vault_url,
                token=vault_token,
                role_id=vault_role_id,
                secret_id=vault_secret_id,
                mount_point=vault_mount_point
            )
        elif manager_type == 'aws':
            region_name = os.environ.get('AWS_REGION', 'us-east-1')
            _secret_manager = AWSSecretsManager(region_name=region_name)
        elif manager_type == 'azure':
            vault_url = os.environ.get('AZURE_VAULT_URL')
            
            if not vault_url:
                raise ValueError("AZURE_VAULT_URL environment variable is required for Azure Key Vault integration")
            
            _secret_manager = AzureKeyVaultManager(vault_url=vault_url)
        else:
            raise ValueError(f"Unsupported secret manager type: {manager_type}")
    
    return _secret_manager


def get_secret(secret_name: str) -> Optional[str]:
    """Get a secret by name."""
    return get_secret_manager().get_secret(secret_name)


def set_secret(secret_name: str, secret_value: str) -> bool:
    """Set a secret value."""
    return get_secret_manager().set_secret(secret_name, secret_value)


def delete_secret(secret_name: str) -> bool:
    """Delete a secret."""
    return get_secret_manager().delete_secret(secret_name)