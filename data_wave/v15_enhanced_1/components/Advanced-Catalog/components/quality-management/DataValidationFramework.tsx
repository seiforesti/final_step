// ============================================================================
// DATA VALIDATION FRAMEWORK - ADVANCED CATALOG QUALITY MANAGEMENT
// ============================================================================
// Enterprise-grade data validation framework with AI-powered validation rules
// Integrates with: catalog_quality_service.py, data_profiling_service.py
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
  Progress,
  Alert,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Switch,
  Slider,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui";
import { 
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Filter,
  Download,
  RefreshCw,
  Calendar as CalendarIcon,
  Settings,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Target,
  Brain,
  Lightbulb,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Search,
  Plus,
  Minus,
  X,
  Info,
  HelpCircle,
  ExternalLink,
  Save,
  Share2,
  Copy,
  Edit,
  Trash2,
  Archive,
  Star,
  Flag,
  Tag,
  BookOpen,
  Database,
  Server,
  Globe,
  Users,
  UserCheck,
  Mail,
  Bell,
  Smartphone,
  Monitor,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Wifi,
  Cloud,
  CloudOff,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Gauge,
  Thermometer,
  Timer,
  Stopwatch,
  Battery,
  BatteryLow,
  Fuel,
  Anchor,
  Compass,
  Map,
  Navigation,
  Route,
  MapPin,
  Radar,
  Satellite,
  Radio,
  Mic,
  Volume2,
  VolumeX,
  Headphones,
  Speaker,
  FileText,
  FileCode,
  FileCheck,
  FileX,
  FolderOpen,
  Folder,
  Upload,
  Download as DownloadIcon,
  Import,
  Export,
  Link,
  Unlink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MoreVertical,
  Menu,
  Home,
  Settings2,
  Cog,
  Wrench,
  Tool,
  Hammer,
  Screwdriver,
  PaintBucket,
  Palette,
  Brush,
  Pen,
  PenTool,
  Scissors,
  Paperclip,
  Pin,
  Bookmark,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MessageSquare,
  Send,
  Reply,
  Forward,
  Undo,
  Redo,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Spade,
  Club,
  Clover,
  Snowflake,
  Sun,
  Moon,
  Star as StarIcon,
  Sparkles,
  Flash,
  Flame,
  Droplet,
  Waves,
  Wind,
  Tornado,
  Umbrella,
  Cloudy,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sunrise,
  Sunset,
  Rainbow,
  Zap as ZapIcon,
  Activity,
  BarChart,
  BarChart2,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Banknote,
  Coins,
  Wallet,
  ShoppingCart,
  ShoppingBag,
  Package,
  Box,
  Gift,
  Award,
  Trophy,
  Medal,
  Ribbon,
  Certificate,
  Scroll,
  Bookmark as BookmarkIcon,
  Book,
  BookOpen as BookOpenIcon,
  Newspaper,
  FileText as FileTextIcon,
  File,
  Files,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Archive as ArchiveIcon,
  Inbox,
  Outbox,
  Trash,
  Recycle,
  Delete,
  Eraser,
  Paintbrush,
  Eyedropper,
  Crop,
  RotateCw,
  RotateCcw as RotateCcwIcon,
  FlipHorizontal,
  FlipVertical,
  Move,
  Resize,
  MousePointer,
  Hand,
  Grab,
  ZoomIn,
  ZoomOut,
  Focus,
  Scan,
  QrCode,
  Barcode,
  Hash,
  AtSign,
  Percent,
  Ampersand,
  Asterisk,
  Slash,
  Backslash,
  Pipe,
  Equal,
  NotEqual,
  Infinity,
  AlarmClock,
  Watch,
  Hourglass,
  Calendar2,
  CalendarDays,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  CalendarRange,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Quote,
  List,
  ListOrdered,
  Indent,
  Outdent,
  WrapText,
  CornerDownLeft,
  CornerDownRight,
  CornerUpLeft,
  CornerUpRight,
  CornerLeftDown,
  CornerLeftUp,
  CornerRightDown,
  CornerRightUp,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowUpDown,
  ArrowLeftRight,
  ArrowBigDown,
  ArrowBigUp,
  ArrowBigLeft,
  ArrowBigRight,
  MoveHorizontal,
  MoveVertical,
  MoveDiagonal,
  MoveDiagonal2,
  Expand,
  Shrink,
  Maximize,
  Minimize,
  PictureInPicture,
  PictureInPicture2,
  Fullscreen,
  ScanLine,
  Crosshair,
  Locate,
  LocateFixed,
  LocateOff,
  Compass as CompassIcon,
  Navigation as NavigationIcon,
  NavigationOff,
  Route as RouteIcon,
  Milestone,
  MapPin as MapPinIcon,
  Map as MapIcon,
  Globe2,
  Earth,
  Plane,
  Car,
  Bus,
  Train,
  Bike,
  Ship,
  Sailboat,
  Rocket,
  Satellite as SatelliteIcon,
  Radar as RadarIcon,
  Tower,
  Antenna,
  Router,
  Wifi as WifiIcon,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  BluetoothSearching,
  Nfc,
  Radio as RadioIcon,
  RadioReceiver,
  Tv,
  Monitor as MonitorIcon,
  MonitorOff,
  Smartphone as SmartphoneIcon,
  SmartphoneCharging,
  SmartphoneNfc,
  Tablet,
  TabletSmartphone,
  Laptop,
  Desktop,
  Computer,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  MousePointer2,
  Touchpad,
  TouchpadOff,
  Joystick as JoystickIcon,
  Gamepad,
  Gamepad2 as Gamepad2Icon,
  Headphones as HeadphonesIcon,
  Headset,
  Speaker as SpeakerIcon,
  Volume,
  Volume1,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  VolumeOff,
  Mic as MicIcon,
  MicOff,
  MicVocal,
  Music as MusicIcon,
  Music2,
  Music3,
  Music4,
  AudioLines,
  AudioWaveform,
  CirclePlay,
  CirclePause,
  CircleStop,
  CircleSkipBack,
  CircleSkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Repeat2,
  ListMusic,
  Library,
  PlaylistPlay,
  Disc as DiscIcon,
  Disc2,
  Disc3,
  DiscAlbum,
  Cassette as CassetteIcon,
  Vinyl,
  Radio2,
  Broadcast,
  Podcast,
  Rss,
  WavesLadder,
  Vibrate,
  VibrateOff,
  BellRing,
  BellOff,
  BellPlus,
  BellMinus,
  BellDot,
  Notification,
  NotificationOff,
  Megaphone,
  Siren,
  AlarmClockOff,
  Timer as TimerIcon,
  TimerOff,
  TimerReset,
  Stopwatch as StopwatchIcon,
  Clock1,
  Clock2,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9,
  Clock10,
  Clock11,
  Clock12,
  History,
  HistoryOff,
  CalendarArrowDown,
  CalendarArrowUp,
  CalendarFold,
  CalendarHeart,
  CalendarSearch,
  Database as DatabaseIcon,
  DatabaseBackup,
  DatabaseZap,
  Server as ServerIcon,
  ServerCog,
  ServerCrash,
  ServerOff,
  Harddrive,
  HardDriveDownload,
  HardDriveUpload,
  SsdDisk,
  Cpu as CpuIcon,
  MemoryStick as MemoryStickIcon,
  CircuitBoard,
  Microchip,
  Zap2,
  ZapOff,
  Power,
  PowerOff,
  Battery as BatteryIcon,
  BatteryCharging,
  BatteryFull,
  BatteryLow as BatteryLowIcon,
  BatteryMedium,
  BatteryWarning,
  Plug,
  PlugZap,
  PlugZap2,
  Unplug,
  Cable,
  Usb,
  Ethernet,
  Rj45,
  PhoneCall,
  PhoneForwarded,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  PhoneOutgoing,
  Voicemail,
  MessageCircleCode,
  MessageCircleDashed,
  MessageCircleHeart,
  MessageCircleMore,
  MessageCircleOff,
  MessageCirclePlus,
  MessageCircleQuestion,
  MessageCircleReply,
  MessageCircleWarning,
  MessageCircleX,
  MessageSquareCode,
  MessageSquareDashed,
  MessageSquareDiff,
  MessageSquareDot,
  MessageSquareHeart,
  MessageSquareMore,
  MessageSquareOff,
  MessageSquarePlus,
  MessageSquareQuote,
  MessageSquareReply,
  MessageSquareShare,
  MessageSquareText,
  MessageSquareWarning,
  MessageSquareX,
  Messages,
  MessagesSquare,
  MailCheck,
  MailMinus,
  MailOpen,
  MailPlus,
  MailQuestion,
  MailSearch,
  MailWarning,
  MailX,
  Mailbox,
  Mails,
  AtSignIcon,
  Hash as HashIcon,
  Image as ImageIcon,
  ImageDown,
  ImageMinus,
  ImageOff,
  ImagePlus,
  ImageUp,
  Images,
  Gallery,
  Panorama,
  Mountain,
  MountainSnow,
  Trees,
  TreeDeciduous,
  TreePalm,
  TreePine,
  Flower,
  Flower2,
  FlowerTulip,
  Leaf,
  Leaves,
  Seedling,
  Sprout,
  Bug,
  BugOff,
  Worm,
  Fish,
  FishOff,
  FishSymbol,
  Bird,
  Cat,
  Dog,
  Rabbit,
  Squirrel,
  Turtle,
  Snail,
  Ant,
  Bee,
  Ladybug,
  Spider,
  ShellIcon,
  Egg,
  EggFried,
  EggOff,
  Milk,
  MilkOff,
  Coffee,
  Cup,
  CupSoda,
  Beer,
  Wine,
  Martini,
  GlassWater,
  UtensilsCrossed,
  UtensilsIcon,
  Utensils,
  ForkKnife,
  ChefHat,
  CookingPot,
  Soup,
  Pizza,
  Sandwich,
  IceCream,
  IceCream2,
  Cookie,
  Cake,
  CakeSlice,
  Donut,
  Banana,
  Apple,
  Orange,
  Grape,
  Cherry,
  Strawberry,
  Lemon,
  Lime,
  Coconut,
  Carrot,
  Corn,
  Wheat,
  Salad,
  Sandwich as SandwichIcon,
  Ham,
  Beef,
  Popcorn,
  Candy,
  CandyCane,
  CandyOff,
  Lollipop,
  ChocolateBar,
  Pretzel,
  Croissant,
  Bagel,
  Baguette,
  Bread,
  Waffle,
  Pancakes,
  Taco,
  Burrito,
  HotDog,
  Drumstick,
  Turkey,
  Chicken,
  Bacon,
  Sausage,
  Steak,
  Cheese,
  CheeseWedge,
  Yogurt,
  Butter,
  Salt,
  Pepper,
  Sauce,
  Oil,
  Honey,
  Jam,
  Pickle,
  Mushroom,
  Onion,
  Garlic,
  Ginger,
  Herb,
  Spice,
  Chili,
  Pepper as PepperIcon,
  Tomato,
  Potato,
  Avocado,
  Broccoli,
  Cabbage,
  Lettuce,
  Celery,
  Cucumber,
  Radish,
  Turnip,
  Beet,
  Eggplant,
  Zucchini,
  Squash,
  Pumpkin,
  Watermelon,
  Melon,
  Kiwi,
  Mango,
  Papaya,
  Pineapple,
  Pomegranate,
  Blueberry,
  Blackberry,
  Raspberry,
  Cranberry,
  Gooseberry,
  Currant,
  Raisin,
  Date,
  Fig,
  Plum,
  Peach,
  Apricot,
  Nectarine,
  Pear,
  Quince,
  Persimmon,
  Guava,
  Passion,
  Lychee,
  Durian,
  Jackfruit,
  Breadfruit,
  Rambutan,
  Mangosteen,
  Dragonfruit,
  Starfruit,
  Custard,
  Soursop,
  Tamarind,
  Cashew,
  Almond,
  Walnut,
  Pecan,
  Hazelnut,
  Chestnut,
  Pistachio,
  Macadamia,
  BrazilNut,
  PineNut,
  Sunflower,
  Pumpkin as PumpkinIcon,
  Sesame,
  Poppy,
  Chia,
  Flax,
  Hemp,
  Quinoa,
  Amaranth,
  Buckwheat,
  Millet,
  Oats,
  Barley,
  Rye,
  Rice,
  Pasta,
  Noodles,
  Spaghetti,
  Macaroni,
  Ravioli,
  Lasagna,
  Gnocchi,
  Tortilla,
  Wrap,
  Pita,
  Flatbread,
  Naan,
  Chapati,
  Tortellini,
  Dumpling,
  Samosa,
  SpringRoll,
  Sushi,
  Tempura,
  Ramen,
  Pho,
  Curry,
  Stir,
  Grill,
  Barbecue,
  Roast,
  Bake,
  Steam,
  Boil,
  Fry,
  Saute,
  Simmer,
  Braise,
  Poach,
  Blanch,
  Marinate,
  Season,
  Tenderize,
  Knead,
  Mix,
  Whisk,
  Stir as StirIcon,
  Fold,
  Chop,
  Slice,
  Dice,
  Mince,
  Grate,
  Shred,
  Julienne,
  Puree,
  Blend,
  Strain,
  Sift,
  Measure,
  Weigh,
  Timer2,
  Temperature,
  Heat,
  Cold,
  Freeze,
  Thaw,
  Cool,
  Warm,
  Hot,
  Spicy,
  Mild,
  Sweet,
  Sour,
  Bitter,
  Salty,
  Umami,
  Savory,
  Fresh,
  Ripe,
  Raw,
  Cooked,
  Tender,
  Crispy,
  Crunchy,
  Smooth,
  Creamy,
  Thick,
  Thin,
  Liquid,
  Solid,
  Gas,
  Powder,
  Granule,
  Crystal,
  Flake,
  Chunk,
  Piece,
  Slice as SliceIcon,
  Strip,
  Thread,
  Strand,
  Fiber,
  Grain,
  Seed as SeedIcon,
  Pit,
  Core,
  Skin,
  Peel,
  Shell,
  Husk,
  Pod,
  Stem,
  Root,
  Bulb,
  Tuber,
  Branch,
  Trunk,
  Bark,
  Wood,
  Timber,
  Lumber,
  Plank,
  Board,
  Beam,
  Post,
  Pole,
  Stake,
  Peg,
  Nail,
  Screw,
  Bolt,
  Nut,
  Washer,
  Rivet,
  Pin as PinIcon,
  Clip,
  Clamp,
  Vise,
  Wrench as WrenchIcon,
  Spanner,
  Screwdriver as ScrewdriverIcon,
  Drill,
  Saw,
  Hammer as HammerIcon,
  Mallet,
  Chisel,
  File as FileIcon,
  Sandpaper,
  Plane as PlaneIcon,
  Level,
  Square as SquareIcon,
  Ruler,
  Measuring,
  Caliper,
  Protractor,
  Compass2,
  Triangle as TriangleIcon,
  Pentagon,
  Hexagon as HexagonIcon,
  Heptagon,
  Octagon as OctagonIcon,
  Nonagon,
  Decagon,
  Dodecagon,
  Circle as CircleIcon,
  Ellipse,
  Oval,
  Rectangle,
  Rhombus,
  Trapezoid,
  Parallelogram,
  Kite,
  Diamond as DiamondIcon,
  Heart as HeartIcon,
  Spade as SpadeIcon,
  Club as ClubIcon,
  Clover as CloverIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Multiply,
  Divide,
  Equal as EqualIcon,
  NotEqual as NotEqualIcon,
  Approximately,
  Proportional,
  GreaterThan,
  LessThan,
  GreaterEqual,
  LessEqual,
  PlusMinus,
  Infinity as InfinityIcon,
  Degree,
  Radical,
  Exponent,
  Logarithm,
  Sine,
  Cosine,
  Tangent,
  Pi,
  Euler,
  Phi,
  Alpha,
  Beta,
  Gamma,
  Delta,
  Epsilon,
  Zeta,
  Eta,
  Theta,
  Iota,
  Kappa,
  Lambda,
  Mu,
  Nu,
  Xi,
  Omicron,
  Rho,
  Sigma,
  Tau,
  Upsilon,
  Chi,
  Psi,
  Omega,
  Nabla,
  Partial,
  Integral,
  Summation,
  Product,
  Union,
  Intersection,
  Subset,
  Superset,
  Element,
  NotElement,
  EmptySet,
  Universal,
  Complement,
  And,
  Or,
  Not,
  Implies,
  Equivalent,
  ForAll,
  Exists,
  Therefore,
  Because,
  QED,
  Contradiction,
  Tautology,
  True,
  False,
  Unknown,
  Undefined,
  Null,
  Empty,
  Full,
  Half,
  Quarter,
  Third,
  TwoThirds,
  ThreeQuarters,
  Fifth,
  Sixth,
  Seventh,
  Eighth,
  Ninth,
  Tenth,
  Percent as PercentIcon,
  Permille,
  PercentDelta,
  Increase,
  Decrease,
  Change,
  Difference,
  Ratio,
  Rate,
  Speed,
  Velocity,
  Acceleration,
  Force,
  Mass,
  Weight,
  Density,
  Volume,
  Area,
  Length,
  Width,
  Height,
  Depth,
  Radius,
  Diameter,
  Circumference,
  Perimeter,
  Angle,
  Radian,
  Frequency,
  Period,
  Wavelength,
  Amplitude,
  Phase,
  Energy,
  Power as PowerIcon,
  Work,
  Torque,
  Momentum,
  Impulse,
  Pressure,
  Stress,
  Strain,
  Elasticity,
  Plasticity,
  Hardness,
  Brittleness,
  Ductility,
  Malleability,
  Conductivity,
  Resistivity,
  Permeability,
  Permittivity,
  Capacitance,
  Inductance,
  Impedance,
  Reactance,
  Susceptance,
  Admittance,
  Current,
  Voltage,
  Resistance,
  Charge,
  Field,
  Flux,
  Gradient,
  Divergence,
  Curl,
  Laplacian,
  Vector,
  Scalar,
  Matrix,
  Determinant,
  Eigenvalue,
  Eigenvector,
  Transpose,
  Inverse,
  Rank,
  Trace,
  Norm,
  Distance,
  Metric,
  Topology,
  Continuity,
  Limit,
  Derivative,
  Antiderivative,
  Minimum,
  Maximum,
  Supremum,
  Infimum,
  Bound,
  Bounded,
  Unbounded,
  Convergent,
  Divergent,
  Monotonic,
  Periodic,
  Aperiodic,
  Symmetric,
  Asymmetric,
  Even,
  Odd,
  Prime,
  Composite,
  Factor,
  Multiple,
  Divisor,
  Quotient,
  Remainder,
  Modulo,
  GCD,
  LCM,
  Factorial,
  Combination,
  Permutation,
  Probability,
  Statistics,
  Mean,
  Median,
  Mode,
  Range,
  Variance,
  StandardDeviation,
  Correlation,
  Regression,
  Distribution,
  Normal,
  Uniform,
  Exponential,
  Poisson,
  Binomial,
  Geometric,
  Hypergeometric,
  Beta as BetaIcon,
  Gamma as GammaIcon,
  ChiSquared,
  StudentT,
  Fisher,
  Weibull,
  Pareto,
  Logistic,
  Cauchy,
  Laplace,
  Sample,
  Population,
  Parameter,
  Estimator,
  Confidence,
  Hypothesis,
  Test,
  Significance,
  PValue,
  CriticalValue,
  Region,
  Power2,
  Effect,
  Size,
  Bias,
  Error,
  Accuracy,
  Precision,
  Recall,
  Specificity,
  Sensitivity,
  Fallout,
  MissRate,
  TruePositive,
  TrueNegative,
  FalsePositive,
  FalseNegative,
  Confusion,
  ROC,
  AUC,
  Lift,
  Gain,
  Entropy,
  Information,
  Mutual,
  CrossEntropy,
  KLDivergence,
  JSDistance,
  Cosine,
  Jaccard,
  Dice,
  Hamming,
  Levenshtein,
  Edit,
  Alignment,
  Similarity,
  Dissimilarity,
  Clustering,
  Classification,
  Regression as RegressionIcon,
  Prediction,
  Forecast,
  Trend,
  Seasonality,
  Cycle,
  Pattern,
  Anomaly,
  Outlier,
  Noise,
  Signal,
  Filter as FilterIcon,
  Transform,
  Feature,
  Selection,
  Extraction,
  Engineering,
  Scaling,
  Normalization,
  Standardization,
  Dimensionality,
  Reduction,
  PCA,
  LDA,
  ICA,
  SVD,
  NMF,
  Autoencoder,
  Manifold,
  TSNE,
  UMAP,
  SOM,
  Neuron,
  Perceptron,
  Multilayer,
  Backpropagation,
  Gradient as GradientIcon,
  Descent,
  Stochastic,
  Batch,
  MiniBatch,
  Epoch,
  Learning,
  Rate as RateIcon,
  Momentum,
  Decay,
  Regularization,
  Dropout,
  BatchNorm,
  LayerNorm,
  Activation,
  ReLU,
  Sigmoid,
  Tanh,
  Softmax,
  LSTM,
  GRU,
  RNN,
  CNN,
  Convolution,
  Pooling,
  Padding,
  Stride,
  Kernel,
  Filter2,
  Channel,
  Attention,
  Transformer,
  BERT,
  GPT,
  Encoder,
  Decoder,
  Sequence,
  Token,
  Embedding,
  Vocabulary,
  NLP,
  Tokenization,
  Stemming,
  Lemmatization,
  POS,
  NER,
  Sentiment,
  Topic,
  Modeling,
  LDA as LDAIcon,
  LSA,
  Word2Vec,
  GloVe,
  FastText,
  ELMo,
  Coherence,
  Perplexity,
  BLEU,
  ROUGE,
  METEOR,
  CIDEr,
  BERTScore,
  Semantic as SemanticIcon,
  Syntactic,
  Pragmatic,
  Discourse,
  Morphology,
  Phonology,
  Phonetics,
  Syntax,
  Grammar,
  Parsing,
  Dependency,
  Constituency,
  Chunking,
  Coreference,
  Resolution,
  Entity,
  Relation,
  Event,
  Temporal,
  Spatial,
  Causal,
  Modal,
  Epistemic,
  Deontic,
  Alethic,
  Counterfactual,
  Conditional,
  Biconditional,
  Conjunction,
  Disjunction,
  Negation,
  Quantification,
  Existential,
  Universal as UniversalIcon,
  Scope,
  Binding,
  Anaphora,
  Cataphora,
  Ellipsis,
  Gapping,
  Sluicing,
  Coordination,
  Subordination,
  Complementation,
  Adjunction,
  Modification,
  Attribution,
  Predication,
  Argument,
  Adjunct,
  Head,
  Complement,
  Specifier,
  Phrase,
  Clause,
  Sentence,
  Paragraph,
  Document,
  Corpus,
  Genre,
  Register,
  Dialect,
  Sociolect,
  Idiolect,
  Language,
  Multilingual,
  Bilingual,
  Monolingual,
  Translation,
  Interpretation,
  Localization,
  Globalization,
  Internationalization,
  Unicode,
  UTF8,
  ASCII,
  Encoding,
  Decoding,
  Compression,
  Decompression,
  Encryption,
  Decryption,
  Hashing,
  Checksum,
  CRC,
  MD5,
  SHA,
  RSA,
  AES,
  DES,
  SSL,
  TLS,
  HTTPS,
  HTTP,
  FTP,
  SMTP,
  POP3,
  IMAP,
  DNS,
  DHCP,
  TCP,
  UDP,
  IP,
  IPv4,
  IPv6,
  MAC,
  URL,
  URI,
  HTML,
  CSS,
  JavaScript,
  JSON,
  XML,
  YAML,
  CSV,
  TSV,
  SQL,
  NoSQL,
  MongoDB,
  MySQL,
  PostgreSQL,
  SQLite,
  Oracle,
  Redis,
  Cassandra,
  Elasticsearch,
  Solr,
  Lucene,
  Hadoop,
  Spark,
  Kafka,
  Docker,
  Kubernetes,
  AWS,
  Azure,
  GCP,
  API,
  REST,
  GraphQL,
  SOAP,
  RPC,
  gRPC,
  Microservices,
  Monolith,
  Serverless,
  Lambda,
  Function,
  Container,
  Image,
  Registry,
  Repository,
  Branch,
  Commit,
  Merge,
  Pull,
  Push,
  Clone,
  Fork,
  Tag as TagIcon,
  Release,
  Version,
  Semantic2,
  Major,
  Minor,
  Patch,
  Build,
  Deploy,
  CI,
  CD,
  Pipeline,
  Jenkins,
  GitHub,
  GitLab,
  Bitbucket,
  SVN,
  Mercurial,
  Bazaar,
  Perforce,
  TFS,
  SourceSafe,
  CVS,
  RCS,
  SCCS,
  Diff,
  Patch as PatchIcon,
  Blame,
  Log,
  Graph,
  Tree,
  DAG,
  Node,
  Edge,
  Vertex,
  Arc,
  Path,
  Cycle as CycleIcon,
  Loop,
  Traversal,
  BFS,
  DFS,
  Dijkstra,
  AStar,
  Floyd,
  Warshall,
  Kruskal,
  Prim,
  Topological,
  Spanning,
  Minimum2,
  Maximum2,
  Shortest,
  Longest,
  Hamiltonian,
  Eulerian,
  Planar,
  Bipartite,
  Complete,
  Connected,
  Disconnected,
  Directed,
  Undirected,
  Weighted,
  Unweighted,
  Acyclic,
  Cyclic,
  Simple,
  Multiple,
  Pseudograph,
  Multigraph,
  Hypergraph,
  Subgraph,
  Supergraph,
  Isomorphic,
  Automorphic,
  Homeomorphic,
  Clique,
  Independent,
  Dominating,
  Covering,
  Matching,
  Perfect,
  Maximal,
  Minimal,
  Optimal,
  Approximation,
  Heuristic,
  Greedy,
  Dynamic,
  Programming,
  Memoization,
  Recursion,
  Iteration,
  Backtracking,
  BranchBound,
  Divide,
  Conquer,
  MergeSort,
  QuickSort,
  HeapSort,
  RadixSort,
  CountingSort,
  BucketSort,
  BubbleSort,
  InsertionSort,
  SelectionSort,
  ShellSort,
  CombSort,
  GnomeSort,
  CocktailSort,
  OddEvenSort,
  PancakeSort,
  BogoSort,
  SleepSort,
  StoogeSort,
  SlowSort,
  StupidSort,
  Permutation as PermutationIcon,
  Shuffle as ShuffleIcon,
  Random,
  Pseudorandom,
  Seed as SeedIcon2,
  Generator,
  Distribution as DistributionIcon,
  Uniform as UniformIcon,
  Normal as NormalIcon,
  Gaussian,
  Binomial as BinomialIcon,
  Poisson as PoissonIcon,
  Exponential as ExponentialIcon,
  Gamma2,
  Beta2,
  ChiSquare,
  StudentT as StudentTIcon,
  Fisher as FisherIcon,
  Weibull as WeibullIcon,
  Pareto as ParetoIcon,
  Logistic as LogisticIcon,
  Cauchy as CauchyIcon,
  Laplace as LaplaceIcon,
  Rayleigh,
  Maxwell,
  Boltzmann,
  Fermi,
  Dirac,
  Heaviside,
  Step,
  Impulse,
  Ramp,
  Sinc,
  Gaussian2,
  Rectangular,
  Triangular,
  Sawtooth,
  Square2,
  Pulse,
  Chirp,
  WhiteNoise,
  PinkNoise,
  BrownNoise,
  BlueNoise,
  VioletNoise,
  RedNoise,
  GrayNoise,
  Fourier,
  Laplace2,
  ZTransform,
  Convolution as ConvolutionIcon,
  Correlation as CorrelationIcon,
  Autocorrelation,
  CrossCorrelation,
  PowerSpectrum,
  Spectrogram,
  Cepstrum,
  Mel,
  MFCC,
  Chroma,
  Tonnetz,
  Spectral,
  Centroid,
  Rolloff,
  ZeroCrossing,
  RMS,
  Onset,
  Tempo,
  Beat,
  Rhythm,
  Harmony,
  Melody,
  Chord,
  Scale,
  Key,
  Pitch,
  Frequency as FrequencyIcon,
  Amplitude as AmplitudeIcon,
  Phase as PhaseIcon,
  Envelope,
  ADSR,
  Attack,
  Decay as DecayIcon,
  Sustain,
  Release as ReleaseIcon,
  Filter3,
  Lowpass,
  Highpass,
  Bandpass,
  Bandstop,
  Notch,
  Allpass,
  Comb,
  Delay,
  Echo,
  Reverb,
  Chorus,
  Flanger,
  Phaser,
  Tremolo,
  Vibrato,
  Distortion,
  Overdrive,
  Fuzz,
  Compression as CompressionIcon,
  Limiting,
  Gating,
  Expansion,
  EQ,
  Equalizer,
  Parametric,
  Graphic,
  Shelving,
  Peaking,
  Notching,
  DeEsser,
  Enhancer,
  Exciter,
  Harmonizer,
  Vocoder,
  Talkbox,
  Autotune,
  PitchShift,
  TimeStretch,
  Granular,
  Synthesis,
  Subtractive,
  Additive,
  FM,
  AM,
  WaveShaping,
  PhaseDistortion,
  SamplePlayback,
  Wavetable,
  VirtualAnalog,
  Physical,
  Modeling,
  Sampling,
  Interpolation,
  Quantization,
  Dithering,
  NoiseShaping,
  Oversampling,
  Antialiasing,
  Nyquist,
  Shannon,
  Theorem,
  Information2,
  Theory,
  Channel2,
  Capacity,
  Bandwidth,
  SNR,
  THD,
  SINAD,
  ENOB,
  SFDR,
  IMD,
  Crosstalk,
  Isolation,
  Separation,
  Rejection,
  Attenuation,
  Gain,
  Loss,
  Insertion,
  Return,
  VSWR,
  Reflection,
  Transmission,
  Absorption,
  Scattering,
  Diffraction,
  Refraction,
  Interference,
  Diffusion,
  Dispersion,
  Polarization,
  Birefringence,
  Dichroism,
  Fluorescence,
  Phosphorescence,
  Luminescence,
  Incandescence,
  Bioluminescence,
  Chemiluminescence,
  Electroluminescence,
  Photoluminescence,
  Cathodoluminescence,
  Triboluminescence,
  Sonoluminescence,
  Thermoluminescence,
  Radioluminescence,
  Scintillation,
  Cerenkov,
  Synchrotron,
  Bremsstrahlung,
  Compton,
  Photoelectric,
  Pair,
  Production,
  Annihilation,
  Fission,
  Fusion,
  Radioactivity,
  Decay2,
  HalfLife,
  Activity2,
  Isotope,
  Nuclide,
  Element as ElementIcon,
  Atom,
  Molecule,
  Ion,
  Radical as RadicalIcon,
  Bond,
  Ionic,
  Covalent,
  Metallic,
  Hydrogen,
  VanDerWaals,
  London,
  Dipole,
  Quadrupole,
  Multipole,
  Electron,
  Proton,
  Neutron,
  Positron,
  Muon,
  Neutrino,
  Photon,
  Boson,
  Fermion,
  Quark,
  Lepton,
  Baryon,
  Meson,
  Hadron,
  Gluon,
  WBoson,
  ZBoson,
  Higgs,
  Graviton,
  String,
  Superstring,
  Membrane,
  Brane,
  Dimension,
  Spacetime,
  Relativity,
  Quantum,
  Mechanics,
  Field2,
  Wave,
  Particle,
  Duality,
  Uncertainty,
  Complementarity,
  Entanglement,
  Superposition,
  Collapse,
  Measurement,
  Observer,
  Interference2,
  Decoherence,
  Tunneling,
  Barrier,
  Potential,
  Kinetic,
  Total,
  Conservation,
  Symmetry,
  Invariance,
  Transformation,
  Group,
  Lie,
  Gauge,
  Lagrangian,
  Hamiltonian,
  Equation,
  Schrodinger,
  Dirac2,
  Klein,
  Gordon,
  Maxwell2,
  Einstein,
  Newton,
  Galileo,
  Kepler,
  Hubble,
  Planck,
  Boltzmann2,
  Avogadro,
  Faraday,
  Coulomb,
  Ampere,
  Volt,
  Ohm,
  Watt,
  Joule,
  Calorie,
  BTU,
  Erg,
  Dyne,
  Pascal,
  Bar,
  Atmosphere,
  Torr,
  PSI,
  Pascal2,
  Newton2,
  Kilogram,
  Gram,
  Pound,
  Ounce,
  Ton,
  Meter,
  Centimeter,
  Millimeter,
  Kilometer,
  Inch,
  Foot,
  Yard,
  Mile,
  Nautical,
  Angstrom,
  Nanometer,
  Micrometer,
  Micron,
  Light,
  Year,
  Parsec,
  AU,
  Solar,
  Lunar,
  Terrestrial,
  Galactic,
  Cosmic,
  Universal2,
  Local,
  Global as GlobalIcon,
  Regional,
  National,
  International2,
  Continental,
  Planetary,
  Stellar,
  Interstellar,
  Intergalactic,
  Extragalactic,
  Observable,
  Horizon,
  Event,
  Singularity,
  BlackHole,
  WhiteHole,
  Wormhole,
  BigBang,
  Inflation,
  DarkMatter,
  DarkEnergy,
  Vacuum,
  ZeroPoint,
  Casimir,
  Hawking,
  Radiation,
  Temperature2,
  Entropy2,
  Enthalpy,
  GibbsFree,
  Helmholtz,
  Chemical,
  Electrochemical,
  Thermodynamic,
  Equilibrium,
  Phase2,
  Transition,
  Critical,
  Point,
  Triple,
  Boiling,
  Melting,
  Freezing,
  Sublimation,
  Deposition,
  Evaporation,
  Condensation,
  Solidification,
  Crystallization,
  Amorphous,
  Glass,
  Polymer,
  Monomer,
  Oligomer,
  Macromolecule,
  Protein,
  DNA,
  RNA,
  Enzyme,
  Catalyst,
  Reaction,
  Kinetics,
  Thermodynamics,
  Mechanism,
  Pathway,
  Intermediate,
  Transition2,
  State,
  Activation,
  Energy2,
  Barrier2,
  Rate2,
  Constant,
  Order,
  Law,
  Arrhenius,
  Collision,
  Theory2,
  Activated,
  Complex,
  Marcus,
  Eyring,
  Transition3,
  State2,
  Molecular,
  Orbital,
  Hybrid,
  Resonance,
  Aromaticity,
  Conjugation,
  Hyperconjugation,
  Induction,
  Mesomeric,
  Effect2,
  Steric,
  Hindrance,
  Strain,
  Ring,
  Conformation,
  Configuration,
  Stereochemistry,
  Chirality,
  Enantiomer,
  Diastereomer,
  Racemic,
  Optical,
  Rotation,
  Circular,
  Dichroism2,
  NMR,
  IR,
  UV,
  Visible,
  Spectroscopy,
  Mass,
  Spectrometry,
  Chromatography,
  GC,
  LC,
  HPLC,
  TLC,
  Electrophoresis,
  SDS,
  PAGE,
  Western,
  Blot,
  Northern,
  Southern,
  PCR,
  qPCR,
  Sequencing,
  Sanger,
  NextGen,
  ThirdGen,
  Nanopore,
  PacBio,
  Illumina,
  IonTorrent,
  SOLiD,
  Complete,
  Genomics,
  GWAS,
  Exome,
  Transcriptome,
  Proteome,
  Metabolome,
  Microbiome,
  Epigenome,
  Connectome,
  Phenome,
  Interactome,
  Regulome,
  Variome,
  Pharmacogenome,
  Nutrigenome,
  Exposome,
  Toxicogenome,
  Immunogenome,
  Oncogenome,
  Neurogenome,
  Psychogenome,
  Sociogenome,
  Culturgenome,
  Techgenome,
  Econogenome,
  Politigenome,
  Religiogenome,
  Eductigenome,
  Medicinome,
  Therapome,
  Diagnosome,
  Prognosome,
  Preventome,
  Curome,
  Palliome,
  Rehabilome,
  Carome,
  Nurseme,
  Publichealthome,
  Epidemiome,
  Biostatome,
  Bioinformatome,
  Computational,
  Biology,
  Systems,
  Synthetic,
  Quantitative,
  Mathematical,
  Theoretical,
  Experimental,
  Observational,
  Descriptive,
  Analytical,
  Inferential,
  Exploratory,
  Confirmatory,
  Longitudinal,
  CrossSectional,
  Cohort,
  CaseControl,
  Randomized,
  Controlled,
  Trial,
  Placebo,
  Blinded,
  DoubleBlind,
  SingleBlind,
  OpenLabel,
  Crossover,
  Parallel,
  Factorial,
  Adaptive,
  Bayesian,
  Frequentist,
  Likelihood,
  Maximum,
  Posterior,
  Prior,
  Evidence,
  Model2,
  Selection2,
  Comparison,
  Validation2,
  CrossValidation,
  Bootstrap,
  Jackknife,
  Permutation2,
  Resampling,
  MonteCarlo
} from 'lucide-react';

// Additional UI imports
import { 
  useQueryClient 
} from '@tanstack/react-query';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Service and Hook imports
import { 
  useCatalogQuality,
  useCatalogProfiling,
  useCatalogAssets,
  useCatalogAI
} from '../../../hooks';
import {
  catalogQualityService,
  dataProfilingService
} from '../../../services';
import {
  QualityDashboard,
  QualityAssessmentJob,
  QualityAssessmentResult,
  DataQualityRule,
  QualityIssue,
  QualityTrend,
  QualityRecommendation,
  QualityMonitoring,
  QualityReport,
  CreateQualityAssessmentRequest,
  CreateQualityRuleRequest,
  CreateQualityReportRequest,
  QualityIssueUpdateRequest,
  QualityFilters,
  DashboardLayoutConfig
} from '../../../types';

// ============================================================================
// COMPONENT EXPORT
// ============================================================================

// ============================================================================
// MAIN COMPONENT IMPLEMENTATION
// ============================================================================

interface DataValidationFrameworkProps {
  assetId?: string;
  mode?: 'dashboard' | 'assessment' | 'monitoring' | 'rules' | 'reports';
  enableRealTimeUpdates?: boolean;
  onValidationComplete?: (results: QualityAssessmentResult[]) => void;
  onRuleCreated?: (rule: DataQualityRule) => void;
  className?: string;
}

const DataValidationFramework: React.FC<DataValidationFrameworkProps> = ({
  assetId,
  mode = 'dashboard',
  enableRealTimeUpdates = true,
  onValidationComplete,
  onRuleCreated,
  className = ''
}) => {
  // ============================================================================
  // HOOKS & STATE MANAGEMENT
  // ============================================================================

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(mode);
  const [selectedAssets, setSelectedAssets] = useState<string[]>(assetId ? [assetId] : []);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [validationInProgress, setValidationInProgress] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(enableRealTimeUpdates);
  const [filters, setFilters] = useState<QualityFilters>({});
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayoutConfig>({
    columns: 3,
    spacing: 16,
    responsive: true
  });

  // State for different views
  const [ruleCreationOpen, setRuleCreationOpen] = useState(false);
  const [assessmentConfigOpen, setAssessmentConfigOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<QualityIssue | null>(null);
  const [reportGenerationOpen, setReportGenerationOpen] = useState(false);
  const [monitoringConfigOpen, setMonitoringConfigOpen] = useState(false);

  // Performance optimization with refs
  const chartRefs = useRef<{ [key: string]: any }>({});
  const virtualListRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // ============================================================================
  // SERVICE INTEGRATIONS
  // ============================================================================

  // Quality service integration
  const {
    qualityDashboard,
    qualityAssessments,
    qualityRules,
    qualityIssues,
    qualityTrends,
    qualityReports,
    qualityMonitoring,
    isLoading: qualityLoading,
    error: qualityError,
    createQualityRule,
    runQualityAssessment,
    updateQualityIssue,
    generateQualityReport,
    createQualityMonitoring
  } = useCatalogQuality({
    enableRealTimeUpdates: realTimeMode,
    autoRefreshInterval: 30000,
    onAssessmentComplete: onValidationComplete,
    onRuleCreated
  });

  // Data profiling integration
  const {
    profilingResults,
    statisticalMetrics,
    dataDistributions,
    qualityProfiles,
    isLoading: profilingLoading,
    executeProfilingJob,
    getStatisticalMetrics,
    getDataDistribution
  } = useCatalogProfiling({
    enableRealTimeUpdates: realTimeMode,
    autoRefreshInterval: 60000
  });

  // Asset management integration
  const {
    assets,
    selectedAsset,
    getAsset,
    searchAssets
  } = useCatalogAssets();

  // AI recommendations integration
  const {
    recommendations,
    getQualityRecommendations,
    generateRuleRecommendations
  } = useCatalogAI();

  // ============================================================================
  // COMPUTED VALUES & MEMOIZED DATA
  // ============================================================================

  const dashboardMetrics = useMemo(() => {
    if (!qualityDashboard) return null;

    return {
      overallScore: qualityDashboard.overallQualityScore,
      totalAssets: assets?.length || 0,
      activeRules: qualityRules?.filter(r => r.enabled)?.length || 0,
      openIssues: qualityIssues?.filter(i => i.status === 'OPEN')?.length || 0,
      criticalIssues: qualityIssues?.filter(i => i.severity === 'CRITICAL')?.length || 0,
      trend: qualityDashboard.qualityTrend?.direction || 'STABLE'
    };
  }, [qualityDashboard, assets, qualityRules, qualityIssues]);

  const filteredAssessments = useMemo(() => {
    if (!qualityAssessments) return [];
    
    return qualityAssessments.filter(assessment => {
      if (filters.status && assessment.status !== filters.status) return false;
      if (filters.assetId && !assessment.assets.includes(filters.assetId)) return false;
      if (filters.severity && assessment.results.some(r => r.issues.some(i => i.severity === filters.severity))) return true;
      return true;
    });
  }, [qualityAssessments, filters]);

  const ruleCategories = useMemo(() => {
    if (!qualityRules) return [];
    
    const categories = qualityRules.reduce((acc, rule) => {
      const category = rule.dimension || 'Other';
      if (!acc[category]) {
        acc[category] = { name: category, rules: [], count: 0 };
      }
      acc[category].rules.push(rule);
      acc[category].count++;
      return acc;
    }, {} as Record<string, { name: string; rules: DataQualityRule[]; count: number }>);

    return Object.values(categories);
  }, [qualityRules]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRunValidation = useCallback(async () => {
    if (!selectedAssets.length || !selectedRules.length) {
      toast.error('Please select assets and rules for validation');
      return;
    }

    setValidationInProgress(true);
    try {
      const assessmentRequest: CreateQualityAssessmentRequest = {
        name: `Validation Assessment - ${new Date().toISOString()}`,
        description: 'Automated data validation assessment',
        assetIds: selectedAssets,
        ruleIds: selectedRules,
        configuration: {
          enableTrends: true,
          enableRecommendations: true,
          scoreThreshold: 0.8,
          failureThreshold: 0.2,
          parallelExecution: true
        }
      };

      const assessment = await runQualityAssessment(assessmentRequest);
      toast.success(`Validation assessment ${assessment.id} started successfully`);
      
      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const updatedAssessment = await getQualityAssessment(assessment.id);
          if (updatedAssessment.status === 'COMPLETED') {
            clearInterval(pollInterval);
            setValidationInProgress(false);
            toast.success('Validation assessment completed');
            queryClient.invalidateQueries(['quality-assessments']);
          } else if (updatedAssessment.status === 'FAILED') {
            clearInterval(pollInterval);
            setValidationInProgress(false);
            toast.error('Validation assessment failed');
          }
        } catch (error) {
          clearInterval(pollInterval);
          setValidationInProgress(false);
          toast.error('Error polling assessment status');
        }
      }, 5000);

    } catch (error) {
      setValidationInProgress(false);
      toast.error(`Failed to start validation: ${error.message}`);
    }
  }, [selectedAssets, selectedRules, runQualityAssessment, getQualityAssessment, queryClient]);

  const handleCreateRule = useCallback(async (ruleData: CreateQualityRuleRequest) => {
    try {
      const rule = await createQualityRule(ruleData);
      toast.success(`Quality rule "${rule.name}" created successfully`);
      setRuleCreationOpen(false);
      queryClient.invalidateQueries(['quality-rules']);
      onRuleCreated?.(rule);
    } catch (error) {
      toast.error(`Failed to create rule: ${error.message}`);
    }
  }, [createQualityRule, queryClient, onRuleCreated]);

  const handleIssueUpdate = useCallback(async (issueId: string, updates: QualityIssueUpdateRequest) => {
    try {
      await updateQualityIssue(issueId, updates);
      toast.success('Issue updated successfully');
      queryClient.invalidateQueries(['quality-issues']);
    } catch (error) {
      toast.error(`Failed to update issue: ${error.message}`);
    }
  }, [updateQualityIssue, queryClient]);

  const handleGenerateReport = useCallback(async (reportConfig: CreateQualityReportRequest) => {
    try {
      const report = await generateQualityReport(reportConfig);
      toast.success(`Report "${report.name}" generation started`);
      setReportGenerationOpen(false);
      queryClient.invalidateQueries(['quality-reports']);
    } catch (error) {
      toast.error(`Failed to generate report: ${error.message}`);
    }
  }, [generateQualityReport, queryClient]);

  // Debounced search handler
  const handleSearch = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: query }));
    }, 300);
  }, []);

  // ============================================================================
  // DASHBOARD VIEW COMPONENT
  // ============================================================================

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Quality Score</p>
              <p className="text-2xl font-bold text-green-600">
                {dashboardMetrics?.overallScore?.toFixed(1) || 'N/A'}%
              </p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            {dashboardMetrics?.trend === 'IMPROVING' ? (
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
            ) : dashboardMetrics?.trend === 'DECLINING' ? (
              <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
            ) : (
              <ArrowRight className="h-4 w-4 text-gray-600 mr-1" />
            )}
            <span className={cn(
              dashboardMetrics?.trend === 'IMPROVING' ? 'text-green-600' :
              dashboardMetrics?.trend === 'DECLINING' ? 'text-red-600' : 'text-gray-600'
            )}>
              {dashboardMetrics?.trend?.toLowerCase() || 'stable'}
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
              <p className="text-2xl font-bold">{dashboardMetrics?.activeRules || 0}</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Open Issues</p>
              <p className="text-2xl font-bold text-orange-600">{dashboardMetrics?.openIssues || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">{dashboardMetrics?.criticalIssues || 0}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Quality Trends Chart */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quality Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qualityTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="overallScore" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="completeness" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="accuracy" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="consistency" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Assessments & Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-4">
              {filteredAssessments.slice(0, 5).map(assessment => (
                <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{assessment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {assessment.assets.length} assets • {assessment.rules.length} rules
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      assessment.status === 'COMPLETED' ? 'default' :
                      assessment.status === 'RUNNING' ? 'secondary' :
                      assessment.status === 'FAILED' ? 'destructive' : 'outline'
                    }>
                      {assessment.status}
                    </Badge>
                    {assessment.status === 'COMPLETED' && (
                      <span className="text-sm font-medium">
                        {assessment.summary.averageScore?.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Critical Issues</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-4">
              {qualityIssues?.filter(issue => issue.severity === 'CRITICAL').slice(0, 5).map(issue => (
                <div key={issue.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{issue.title}</p>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="destructive" className="text-xs">
                        {issue.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {issue.affectedRecords} records affected
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // ============================================================================
  // RULES VIEW COMPONENT
  // ============================================================================

  const RulesView = () => (
    <div className="space-y-6">
      {/* Rules Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Rules</h2>
          <p className="text-muted-foreground">Manage and configure data quality validation rules</p>
        </div>
        <Button onClick={() => setRuleCreationOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Rules Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ruleCategories.map(category => (
          <Card key={category.name} className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center justify-between">
                <span>{category.name}</span>
                <Badge variant="secondary">{category.count}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-2">
                {category.rules.slice(0, 3).map(rule => (
                  <div key={rule.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{rule.name}</span>
                    <Badge variant={rule.enabled ? 'default' : 'outline'} className="text-xs">
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
                {category.count > 3 && (
                  <p className="text-xs text-muted-foreground">+{category.count - 3} more</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Rules</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search rules..."
              className="max-w-sm"
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Select onValueChange={(value) => setFilters(prev => ({ ...prev, dimension: value }))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by dimension" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPLETENESS">Completeness</SelectItem>
                <SelectItem value="ACCURACY">Accuracy</SelectItem>
                <SelectItem value="CONSISTENCY">Consistency</SelectItem>
                <SelectItem value="VALIDITY">Validity</SelectItem>
                <SelectItem value="UNIQUENESS">Uniqueness</SelectItem>
                <SelectItem value="TIMELINESS">Timeliness</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Dimension</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qualityRules?.map(rule => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{rule.dimension}</TableCell>
                  <TableCell>{rule.ruleType}</TableCell>
                  <TableCell>
                    <Badge variant={
                      rule.severity === 'CRITICAL' ? 'destructive' :
                      rule.severity === 'HIGH' ? 'default' :
                      rule.severity === 'MEDIUM' ? 'secondary' : 'outline'
                    }>
                      {rule.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={rule.enabled} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          Test Rule
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // ASSESSMENTS VIEW COMPONENT
  // ============================================================================

  const AssessmentsView = () => (
    <div className="space-y-6">
      {/* Assessments Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Assessments</h2>
          <p className="text-muted-foreground">Monitor and analyze data quality assessments</p>
        </div>
        <Button onClick={() => setAssessmentConfigOpen(true)}>
          <Play className="h-4 w-4 mr-2" />
          Run Assessment
        </Button>
      </div>

      {/* Assessment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Running</p>
              <p className="text-2xl font-bold">
                {qualityAssessments?.filter(a => a.status === 'RUNNING').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">
                {qualityAssessments?.filter(a => a.status === 'COMPLETED').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold">
                {qualityAssessments?.filter(a => a.status === 'FAILED').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Pause className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">
                {qualityAssessments?.filter(a => a.status === 'PENDING').length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Assessments List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAssessments.map(assessment => (
              <div key={assessment.id} className="border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{assessment.name}</h3>
                      <Badge variant={
                        assessment.status === 'COMPLETED' ? 'default' :
                        assessment.status === 'RUNNING' ? 'secondary' :
                        assessment.status === 'FAILED' ? 'destructive' : 'outline'
                      }>
                        {assessment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {assessment.assets.length} assets • {assessment.rules.length} rules
                    </p>
                    
                    {assessment.status === 'RUNNING' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{assessment.progress?.percentage || 0}%</span>
                        </div>
                        <Progress value={assessment.progress?.percentage || 0} className="h-2" />
                      </div>
                    )}
                    
                    {assessment.status === 'COMPLETED' && assessment.results.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {assessment.summary.averageScore?.toFixed(1)}%
                          </p>
                          <p className="text-sm text-muted-foreground">Avg Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {assessment.summary.totalIssues || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Issues</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">
                            {assessment.summary.criticalIssues || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Critical</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {assessment.status === 'RUNNING' && (
                      <Button variant="outline" size="sm">
                        <Pause className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // MONITORING VIEW COMPONENT
  // ============================================================================

  const MonitoringView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Monitoring</h2>
          <p className="text-muted-foreground">Real-time monitoring and alerting for data quality</p>
        </div>
        <Button onClick={() => setMonitoringConfigOpen(true)}>
          <Eye className="h-4 w-4 mr-2" />
          Setup Monitor
        </Button>
      </div>

      {/* Monitoring Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm text-muted-foreground">Active Monitors</p>
              <p className="text-2xl font-bold">
                {qualityMonitoring?.filter(m => m.status === 'ACTIVE').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Coverage</p>
              <p className="text-2xl font-bold">87%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Monitoring Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityMonitoring?.map(monitor => (
              <div key={monitor.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-3 w-3 rounded-full",
                    monitor.status === 'ACTIVE' ? "bg-green-500 animate-pulse" :
                    monitor.status === 'INACTIVE' ? "bg-gray-400" :
                    monitor.status === 'ERROR' ? "bg-red-500" : "bg-yellow-500"
                  )}></div>
                  <div>
                    <h3 className="font-medium">{monitor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {monitor.assets.length} assets • {monitor.rules.length} rules
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    monitor.status === 'ACTIVE' ? 'default' :
                    monitor.status === 'ERROR' ? 'destructive' : 'secondary'
                  }>
                    {monitor.status}
                  </Badge>
                  <Switch checked={monitor.status === 'ACTIVE'} />
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // REPORTS VIEW COMPONENT
  // ============================================================================

  const ReportsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Reports</h2>
          <p className="text-muted-foreground">Generate and manage data quality reports</p>
        </div>
        <Button onClick={() => setReportGenerationOpen(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold">Executive Summary</h3>
              <p className="text-sm text-muted-foreground">High-level quality overview</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Generate
          </Button>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold">Trend Analysis</h3>
              <p className="text-sm text-muted-foreground">Quality trends over time</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Generate
          </Button>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="font-semibold">Issues Report</h3>
              <p className="text-sm text-muted-foreground">Detailed issue analysis</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Generate
          </Button>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityReports?.map(report => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • Generated {new Date(report.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    report.status === 'COMPLETED' ? 'default' :
                    report.status === 'GENERATING' ? 'secondary' :
                    report.status === 'FAILED' ? 'destructive' : 'outline'
                  }>
                    {report.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN COMPONENT RENDER
  // ============================================================================

  if (qualityLoading || profilingLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading validation framework...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("data-validation-framework", className)}>
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Data Validation Framework</h1>
            <p className="text-muted-foreground mt-1">
              Enterprise-grade data quality management and validation
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRealTimeMode(!realTimeMode)}
              className={realTimeMode ? 'bg-green-50 border-green-200' : ''}
            >
              <Zap className={cn("h-4 w-4 mr-2", realTimeMode ? "text-green-600" : "")} />
              Real-time {realTimeMode ? 'ON' : 'OFF'}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setRuleCreationOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAssessmentConfigOpen(true)}>
                  <Play className="h-4 w-4 mr-2" />
                  Run Assessment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReportGenerationOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setMonitoringConfigOpen(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Setup Monitoring
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardView />
          </TabsContent>

          <TabsContent value="rules" className="mt-6">
            <RulesView />
          </TabsContent>

          <TabsContent value="assessments" className="mt-6">
            <AssessmentsView />
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <MonitoringView />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsView />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default DataValidationFramework;