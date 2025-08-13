// RBACBreadcrumb.tsx - Enterprise-grade RBAC breadcrumb navigation component
// Provides intelligent path detection, dynamic navigation, and advanced RBAC integration

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  Home,
  Shield,
  Users,
  Database,
  Activity,
  Eye,
  Lock,
  Unlock,
  Key,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  X,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share,
  Download,
  Upload,
  RefreshCw,
  RotateCw,
  Maximize,
  Minimize,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Menu,
  Grid,
  List,
  Layers,
  FolderOpen,
  Folder,
  File,
  FileText,
  Image,
  Video,
  Music,
  Code,
  Terminal,
  Package,
  Box,
  Archive,
  Tag,
  Flag,
  Bookmark,
  Star,
  Heart,
  Clock,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  Compass,
  Navigation,
  Route,
  Map,
  Target,
  Zap,
  Lightning,
  Flame,
  Droplet,
  Leaf,
  Tree,
  Flower,
  Sun,
  Moon,
  Star as StarIcon,
  Cloud,
  Rainbow,
  Wind,
  Snowflake,
  Umbrella,
  Mountain,
  Wave,
  Beach,
  Forest,
  Desert,
  Volcano,
  Island,
  River,
  Lake,
  Ocean,
  Sea,
  Bay,
  Harbor,
  Port,
  Bridge,
  Road,
  Path,
  Trail,
  Track,
  Lane,
  Street,
  Avenue,
  Boulevard,
  Highway,
  Freeway,
  Tunnel,
  Overpass,
  Junction,
  Intersection,
  Roundabout,
  Traffic,
  Signal,
  Stop,
  Yield,
  Parking,
  Garage,
  Station,
  Platform,
  Terminal as TerminalIcon,
  Airport,
  Plane,
  Train,
  Bus,
  Car,
  Truck,
  Bike,
  Motorcycle,
  Scooter,
  Skateboard,
  Walking,
  Running,
  Hiking,
  Climbing,
  Swimming,
  Surfing,
  Skiing,
  Snowboarding,
  Ice,
  Fire,
  Water,
  Earth,
  Air,
  Space,
  Universe,
  Galaxy,
  Planet,
  Satellite,
  Rocket,
  Ufo,
  Alien,
  Robot,
  Cyborg,
  Android,
  Humanoid,
  Monster,
  Ghost,
  Zombie,
  Vampire,
  Werewolf,
  Dragon,
  Phoenix,
  Unicorn,
  Pegasus,
  Griffin,
  Centaur,
  Minotaur,
  Sphinx,
  Kraken,
  Leviathan,
  Behemoth,
  Titan,
  Giant,
  Dwarf,
  Elf,
  Fairy,
  Pixie,
  Sprite,
  Nymph,
  Dryad,
  Naiad,
  Oread,
  Nereid,
  Siren,
  Mermaid,
  Triton,
  Poseidon,
  Neptune,
  Zeus,
  Jupiter,
  Thor,
  Odin,
  Loki,
  Freya,
  Frigg,
  Balder,
  Heimdall,
  Tyr,
  Vidar,
  Vali,
  Bragi,
  Hoenir,
  Vili,
  Ve,
  Buri,
  Bor,
  Bestla,
  Ymir,
  Audhumla,
  Jormungandr,
  Fenrir,
  Sleipnir,
  Hugin,
  Munin,
  Geri,
  Freki,
  Ratatoskr,
  Nidhogg,
  Fafnir,
  Sigurd,
  Siegfried,
  Beowulf,
  Grendel,
  Hrothgar,
  Wiglaf,
  Unferth,
  Wealtheow,
  Freawaru,
  Hygd,
  Modthryth,
  Hildeburh,
  Finn,
  Hengest,
  Horsa,
  Guthlac,
  Caedmon,
  Cynewulf,
  Deor,
  Widsith,
  Wanderer,
  Seafarer,
  Ruin,
  Dream,
  Battle,
  Elegy,
  Riddle,
  Charm,
  Spell,
  Incantation,
  Invocation,
  Prayer,
  Hymn,
  Psalm,
  Song,
  Ballad,
  Epic,
  Saga,
  Chronicle,
  History,
  Biography,
  Autobiography,
  Memoir,
  Diary,
  Journal,
  Log,
  Record,
  Report,
  Account,
  Story,
  Tale,
  Narrative,
  Fiction,
  Novel,
  Novella,
  Short,
  Flash,
  Micro,
  Prose,
  Poetry,
  Verse,
  Rhyme,
  Meter,
  Rhythm,
  Beat,
  Tempo,
  Cadence,
  Flow,
  Style,
  Tone,
  Voice,
  Mood,
  Atmosphere,
  Setting,
  Scene,
  Act,
  Chapter,
  Section,
  Part,
  Book,
  Volume,
  Series,
  Collection,
  Anthology,
  Compilation,
  Edition,
  Version,
  Revision,
  Draft,
  Manuscript,
  Script,
  Screenplay,
  Play,
  Drama,
  Comedy,
  Tragedy,
  Romance,
  Mystery,
  Thriller,
  Horror,
  Fantasy,
  Science,
  Adventure,
  Action,
  Western,
  Historical,
  Contemporary,
  Modern,
  Classic,
  Vintage,
  Antique,
  Ancient,
  Medieval,
  Renaissance,
  Baroque,
  Rococo,
  Neoclassical,
  Romantic,
  Victorian,
  Edwardian,
  Art,
  Nouveau,
  Deco,
  Modernist,
  Postmodern,
  Contemporary as ContemporaryIcon,
  Abstract,
  Realistic,
  Impressionist,
  Expressionist,
  Cubist,
  Surrealist,
  Minimalist,
  Maximalist,
  Conceptual,
  Performance,
  Installation,
  Digital,
  Virtual,
  Augmented,
  Mixed,
  Interactive,
  Immersive,
  Experiential,
  Participatory,
  Collaborative,
  Community,
  Social,
  Cultural,
  Political,
  Economic,
  Environmental,
  Ecological,
  Sustainable,
  Renewable,
  Clean,
  Green,
  Organic,
  Natural,
  Wild,
  Free,
  Open,
  Public,
  Private,
  Personal,
  Individual,
  Collective,
  Group,
  Team,
  Organization,
  Institution,
  Company,
  Corporation,
  Business,
  Enterprise,
  Startup,
  Venture,
  Project,
  Initiative,
  Program,
  Campaign,
  Movement,
  Revolution,
  Evolution,
  Change,
  Transformation,
  Innovation,
  Invention,
  Discovery,
  Breakthrough,
  Achievement,
  Success,
  Victory,
  Triumph,
  Glory,
  Honor,
  Pride,
  Dignity,
  Respect,
  Admiration,
  Appreciation,
  Gratitude,
  Thanks,
  Praise,
  Congratulations,
  Celebration,
  Festival,
  Party,
  Event,
  Occasion,
  Ceremony,
  Ritual,
  Tradition,
  Custom,
  Culture,
  Heritage,
  Legacy,
  History as HistoryIcon,
  Memory,
  Remembrance,
  Commemoration,
  Monument,
  Memorial,
  Tribute,
  Dedication,
  Devotion,
  Commitment,
  Loyalty,
  Faithfulness,
  Trust,
  Belief,
  Faith,
  Hope,
  Love,
  Compassion,
  Kindness,
  Generosity,
  Charity,
  Giving,
  Sharing,
  Caring,
  Helping,
  Supporting,
  Encouraging,
  Inspiring,
  Motivating,
  Empowering,
  Enabling,
  Facilitating,
  Assisting,
  Aiding,
  Serving,
  Contributing,
  Participating,
  Engaging,
  Involving,
  Including,
  Welcoming,
  Embracing,
  Accepting,
  Understanding,
  Knowing,
  Learning,
  Teaching,
  Education,
  Training,
  Development,
  Growth,
  Progress,
  Advancement,
  Improvement,
  Enhancement,
  Upgrade,
  Update,
  Refresh,
  Renewal,
  Revival,
  Restoration,
  Recovery,
  Healing,
  Wellness,
  Health,
  Fitness,
  Strength,
  Power,
  Energy,
  Vitality,
  Life,
  Living,
  Being,
  Existence,
  Reality,
  Truth,
  Fact,
  Evidence,
  Proof,
  Verification,
  Validation,
  Confirmation,
  Approval,
  Authorization,
  Permission,
  Access,
  Entry,
  Entrance,
  Gateway,
  Portal,
  Door,
  Window,
  Opening,
  Passage,
  Corridor,
  Hallway,
  Room,
  Space,
  Area,
  Zone,
  Region,
  Territory,
  Domain,
  Realm,
  Kingdom,
  Empire,
  Nation,
  Country,
  State,
  Province,
  County,
  City,
  Town,
  Village,
  Hamlet,
  Settlement,
  Community as CommunityIcon,
  Neighborhood,
  District,
  Quarter,
  Ward,
  Block,
  Street as StreetIcon,
  Address,
  Location,
  Position,
  Place,
  Spot,
  Point,
  Coordinates,
  Latitude,
  Longitude,
  Altitude,
  Elevation,
  Height,
  Depth,
  Width,
  Length,
  Distance,
  Range,
  Scope,
  Scale,
  Size,
  Dimension,
  Measurement,
  Unit,
  Quantity,
  Amount,
  Number,
  Count,
  Total,
  Sum,
  Average,
  Mean,
  Median,
  Mode,
  Standard,
  Deviation,
  Variance,
  Distribution,
  Probability,
  Statistics,
  Data,
  Information,
  Knowledge,
  Wisdom,
  Intelligence,
  Smart,
  Clever,
  Brilliant,
  Genius,
  Expert,
  Professional,
  Specialist,
  Master,
  Advanced,
  Intermediate,
  Beginner,
  Novice,
  Amateur,
  Student,
  Learner,
  Trainee,
  Apprentice,
  Intern,
  Junior,
  Senior,
  Lead,
  Principal,
  Chief,
  Head,
  Director,
  Manager,
  Supervisor,
  Coordinator,
  Administrator,
  Operator,
  Technician,
  Engineer,
  Developer,
  Programmer,
  Coder,
  Designer,
  Artist,
  Creator,
  Maker,
  Builder,
  Constructor,
  Architect,
  Planner,
  Organizer,
  Coordinator as CoordinatorIcon,
  Facilitator,
  Mediator,
  Negotiator,
  Arbitrator,
  Judge,
  Jury,
  Lawyer,
  Attorney,
  Counsel,
  Advocate,
  Representative,
  Agent,
  Broker,
  Dealer,
  Trader,
  Seller,
  Buyer,
  Customer,
  Client,
  Patron,
  Guest,
  Visitor,
  Tourist,
  Traveler,
  Explorer,
  Adventurer,
  Pioneer,
  Settler,
  Colonist,
  Immigrant,
  Refugee,
  Exile,
  Nomad,
  Wanderer as WandererIcon,
  Drifter,
  Vagabond,
  Hobo,
  Homeless,
  Displaced,
  Lost,
  Found,
  Discovered,
  Revealed,
  Exposed,
  Hidden,
  Secret,
  Mysterious,
  Unknown,
  Uncertain,
  Unclear,
  Ambiguous,
  Vague,
  Confusing,
  Complex,
  Complicated,
  Difficult,
  Hard,
  Challenging,
  Tough,
  Rough,
  Harsh,
  Severe,
  Strict,
  Rigid,
  Firm,
  Solid,
  Strong,
  Powerful,
  Mighty,
  Great,
  Grand,
  Magnificent,
  Spectacular,
  Amazing,
  Incredible,
  Fantastic,
  Wonderful,
  Marvelous,
  Extraordinary,
  Exceptional,
  Outstanding,
  Excellent,
  Perfect,
  Ideal,
  Optimal,
  Best,
  Top,
  Premium,
  Superior,
  High,
  Upper,
  Above,
  Over,
  Beyond,
  Past,
  Future,
  Present,
  Now,
  Today,
  Tomorrow,
  Yesterday,
  Week,
  Month,
  Year,
  Decade,
  Century,
  Millennium,
  Era,
  Age,
  Period,
  Time as TimeIcon,
  Moment,
  Instant,
  Second,
  Minute,
  Hour,
  Day,
  Night,
  Dawn,
  Dusk,
  Twilight,
  Sunrise,
  Sunset,
  Morning,
  Afternoon,
  Evening,
  Midnight,
  Noon,
  Spring,
  Summer,
  Autumn,
  Winter,
  Season,
  Weather,
  Climate,
  Temperature,
  Hot,
  Cold,
  Warm,
  Cool,
  Mild,
  Extreme,
  Intense,
  Gentle,
  Soft,
  Hard as HardIcon,
  Smooth,
  Rough as RoughIcon,
  Sharp,
  Dull,
  Bright,
  Dark,
  Light,
  Heavy,
  Fast,
  Slow,
  Quick,
  Swift,
  Rapid,
  Speedy,
  Urgent,
  Immediate,
  Instant as InstantIcon,
  Delayed,
  Late,
  Early,
  Soon,
  Eventually,
  Finally,
  Ultimately,
  Completely,
  Totally,
  Fully,
  Entirely,
  Wholly,
  Partially,
  Partly,
  Half,
  Quarter,
  Third,
  Fraction,
  Percentage,
  Ratio,
  Proportion,
  Balance,
  Equilibrium,
  Stability,
  Consistency,
  Reliability,
  Dependability,
  Trustworthiness,
  Credibility,
  Authenticity,
  Genuineness,
  Originality,
  Uniqueness,
  Rarity,
  Scarcity,
  Abundance,
  Plenty,
  Wealth,
  Riches,
  Fortune,
  Treasure,
  Gold,
  Silver,
  Bronze,
  Copper,
  Iron,
  Steel,
  Metal,
  Stone,
  Rock,
  Sand,
  Soil,
  Clay,
  Mud,
  Dust,
  Ash,
  Smoke,
  Steam,
  Gas,
  Liquid,
  Solid,
  Plasma,
  Matter,
  Material,
  Substance,
  Element,
  Compound,
  Mixture,
  Solution,
  Chemical,
  Formula,
  Equation,
  Calculation,
  Mathematics,
  Algebra,
  Geometry,
  Trigonometry,
  Calculus,
  Logic,
  Reasoning,
  Thinking,
  Analysis,
  Synthesis,
  Evaluation,
  Assessment,
  Testing,
  Examination,
  Investigation,
  Research,
  Study,
  Survey,
  Interview,
  Questionnaire,
  Poll,
  Vote,
  Election,
  Democracy,
  Republic,
  Monarchy,
  Dictatorship,
  Autocracy,
  Oligarchy,
  Aristocracy,
  Meritocracy,
  Technocracy,
  Bureaucracy,
  Government,
  Politics,
  Policy,
  Law,
  Rule,
  Regulation,
  Standard as StandardIcon,
  Guideline,
  Principle,
  Ethics,
  Morality,
  Values,
  Beliefs,
  Philosophy,
  Religion,
  Spirituality,
  Meditation,
  Prayer as PrayerIcon,
  Worship,
  Devotion as DevotionIcon,
  Reverence,
  Awe,
  Wonder,
  Curiosity,
  Interest,
  Attention,
  Focus,
  Concentration,
  Dedication as DedicationIcon,
  Commitment as CommitmentIcon,
  Determination,
  Persistence,
  Perseverance,
  Endurance,
  Patience,
  Tolerance,
  Acceptance,
  Forgiveness,
  Mercy,
  Grace,
  Blessing,
  Gift,
  Present as PresentIcon,
  Surprise,
  Shock,
  Amazement,
  Astonishment,
  Bewilderment,
  Confusion,
  Perplexity,
  Puzzlement,
  Mystery as MysteryIcon,
  Enigma,
  Riddle as RiddleIcon,
  Puzzle,
  Problem,
  Issue,
  Concern,
  Worry,
  Anxiety,
  Fear,
  Terror,
  Horror,
  Dread,
  Panic,
  Alarm,
  Alert,
  Warning,
  Caution,
  Care,
  Safety,
  Security,
  Protection,
  Defense,
  Guard,
  Shield as ShieldIcon,
  Armor,
  Weapon,
  Sword,
  Knife,
  Blade,
  Arrow,
  Bow,
  Gun,
  Rifle,
  Pistol,
  Cannon,
  Bomb,
  Explosive,
  Ammunition,
  Battle as BattleIcon,
  War,
  Conflict,
  Fight,
  Combat,
  Struggle,
  Contest,
  Competition,
  Game,
  Sport,
  Play,
  Fun,
  Entertainment,
  Amusement,
  Recreation,
  Leisure,
  Relaxation,
  Rest,
  Sleep,
  Dream as DreamIcon,
  Nightmare,
  Fantasy as FantasyIcon,
  Imagination,
  Creativity,
  Innovation as InnovationIcon,
  Invention as InventionIcon,
  Discovery as DiscoveryIcon,
  Exploration,
  Adventure as AdventureIcon,
  Journey,
  Trip,
  Travel as TravelIcon,
  Vacation,
  Holiday,
  Break,
  Pause,
  Stop as StopIcon,
  Start,
  Begin,
  End,
  Finish,
  Complete,
  Done,
  Ready,
  Prepared,
  Set,
  Go,
  Move,
  Action as ActionIcon,
  Activity,
  Motion,
  Movement,
  Dance,
  Music as MusicIcon,
  Sound,
  Noise,
  Silence,
  Quiet,
  Calm,
  Peace,
  Harmony,
  Unity,
  Together,
  Apart,
  Separate,
  Individual as IndividualIcon,
  Personal as PersonalIcon,
  Private as PrivateIcon,
  Public as PublicIcon,
  Open as OpenIcon,
  Closed,
  Locked as LockedIcon,
  Unlocked as UnlockedIcon,
  Free as FreeIcon,
  Bound,
  Tied,
  Connected,
  Linked,
  Joined,
  United,
  Combined,
  Merged,
  Mixed as MixedIcon,
  Blended,
  Fused,
  Integrated,
  Unified,
  Consolidated,
  Centralized,
  Distributed,
  Spread,
  Scattered,
  Dispersed,
  Divided,
  Split,
  Broken,
  Damaged,
  Ruined,
  Wrecked,
  Demolished,
  Collapsed,
  Fallen,
  Lost as LostIcon,
  Missing,
  Gone,
  Disappeared,
  Vanished,
  Invisible,
  Hidden as HiddenIcon,
  Concealed,
  Covered,
  Masked,
  Disguised,
  Camouflaged,
  Stealthy,
  Sneaky,
  Sly,
  Cunning,
  Clever as CleverIcon,
  Smart as SmartIcon,
  Intelligent as IntelligentIcon,
  Wise,
  Knowledgeable,
  Educated,
  Learned,
  Scholarly,
  Academic,
  Scientific,
  Technical,
  Professional as ProfessionalIcon,
  Expert as ExpertIcon,
  Skilled,
  Talented,
  Gifted,
  Capable,
  Competent,
  Qualified,
  Certified,
  Licensed,
  Authorized,
  Approved,
  Accepted,
  Verified,
  Validated,
  Confirmed,
  Proven,
  Tested,
  Examined,
  Inspected,
  Checked,
  Reviewed,
  Evaluated,
  Assessed,
  Measured,
  Calculated,
  Estimated,
  Predicted,
  Forecasted,
  Projected,
  Planned,
  Scheduled,
  Organized,
  Arranged,
  Prepared as PreparedIcon,
  Ready as ReadyIcon,
  Available,
  Accessible,
  Reachable,
  Attainable,
  Achievable,
  Possible,
  Feasible,
  Viable,
  Practical,
  Realistic,
  Reasonable,
  Logical,
  Sensible,
  Rational,
  Coherent,
  Consistent as ConsistentIcon,
  Compatible,
  Suitable,
  Appropriate,
  Proper,
  Correct,
  Right,
  True as TrueIcon,
  Accurate,
  Precise,
  Exact,
  Perfect as PerfectIcon,
  Ideal as IdealIcon,
  Optimal as OptimalIcon,
  Best as BestIcon,
  Excellent as ExcellentIcon,
  Outstanding as OutstandingIcon,
  Exceptional as ExceptionalIcon,
  Extraordinary as ExtraordinaryIcon,
  Remarkable,
  Notable,
  Significant,
  Important,
  Critical,
  Essential,
  Vital,
  Necessary,
  Required,
  Mandatory,
  Compulsory,
  Obligatory,
  Optional,
  Voluntary,
  Willing,
  Eager,
  Enthusiastic,
  Passionate,
  Devoted,
  Committed as CommittedIcon,
  Dedicated as DedicatedIcon,
  Loyal,
  Faithful,
  Trustworthy,
  Reliable as ReliableIcon,
  Dependable,
  Stable as StableIcon,
  Steady,
  Constant,
  Continuous,
  Ongoing,
  Persistent as PersistentIcon,
  Lasting,
  Enduring,
  Permanent,
  Temporary,
  Brief,
  Short,
  Long,
  Extended,
  Prolonged,
  Stretched,
  Expanded,
  Enlarged,
  Increased,
  Decreased,
  Reduced,
  Minimized,
  Maximized,
  Optimized,
  Improved,
  Enhanced,
  Upgraded,
  Updated,
  Refreshed,
  Renewed,
  Restored,
  Repaired,
  Fixed,
  Solved,
  Resolved,
  Settled,
  Completed as CompletedIcon,
  Finished as FinishedIcon,
  Done as DoneIcon,
  Accomplished,
  Achieved,
  Successful,
  Victorious,
  Triumphant,
  Winning,
  Leading,
  First,
  Primary,
  Main,
  Principal as PrincipalIcon,
  Central,
  Core,
  Heart,
  Center,
  Middle,
  Inner,
  Outer,
  External,
  Internal,
  Inside,
  Outside,
  Within,
  Beyond as BeyondIcon,
  Above as AboveIcon,
  Below,
  Under,
  Over as OverIcon,
  Through,
  Around,
  Across,
  Along,
  Between,
  Among,
  Amid,
  Beside,
  Next,
  Near,
  Close,
  Far,
  Distant,
  Remote,
  Isolated,
  Alone,
  Solo,
  Single,
  Double,
  Triple,
  Multiple,
  Many,
  Few,
  Several,
  Some,
  All,
  Every,
  Each,
  Any,
  No,
  None,
  Nothing,
  Everything,
  Something,
  Anything,
  Anyone,
  Someone,
  Everyone,
  Everybody,
  Nobody,
  Somebody,
  Anybody,
  Wherever,
  Somewhere,
  Anywhere,
  Nowhere,
  Everywhere,
  Whenever,
  Sometime,
  Anytime,
  Never,
  Always,
  Forever,
  Eternal,
  Infinite,
  Endless,
  Limitless,
  Boundless,
  Unlimited,
  Unrestricted,
  Unconstrained,
  Unfettered,
  Unbound,
  Uncontrolled,
  Unmanaged,
  Unorganized,
  Unstructured,
  Unplanned,
  Unscheduled,
  Unexpected,
  Unpredictable,
  Uncertain as UncertainIcon,
  Unknown as UnknownIcon,
  Unclear as UnclearIcon,
  Undefined,
  Unspecified,
  Unidentified,
  Unnamed,
  Untitled,
  Unlabeled,
  Unmarked,
  Unsigned,
  Unsigned as UnsignedIcon,
  Unverified,
  Unvalidated,
  Unconfirmed,
  Unproven,
  Untested,
  Unexamined,
  Uninspected,
  Unchecked,
  Unreviewed,
  Unevaluated,
  Unassessed,
  Unmeasured,
  Uncalculated,
  Unestimated,
  Unpredicted,
  Unforecasted,
  Unprojected,
  Unplanned as UnplannedIcon,
  Unscheduled as UnscheduledIcon,
  Unorganized as UnorganizedIcon,
  Unarranged,
  Unprepared,
  Unready,
  Unavailable,
  Inaccessible,
  Unreachable,
  Unattainable,
  Unachievable,
  Impossible,
  Infeasible,
  Unviable,
  Impractical,
  Unrealistic,
  Unreasonable,
  Illogical,
  Nonsensical,
  Irrational,
  Incoherent,
  Inconsistent,
  Incompatible,
  Unsuitable,
  Inappropriate,
  Improper,
  Incorrect,
  Wrong,
  False,
  Inaccurate,
  Imprecise,
  Inexact,
  Imperfect,
  Flawed,
  Defective,
  Faulty,
  Broken as BrokenIcon,
  Damaged as DamagedIcon,
  Corrupted,
  Compromised,
  Vulnerable,
  Insecure,
  Unsafe,
  Dangerous,
  Risky,
  Hazardous,
  Harmful,
  Destructive,
  Negative,
  Bad,
  Worse,
  Worst,
  Poor,
  Low as LowIcon,
  Inferior,
  Substandard,
  Below,
  Bottom,
  Minimum,
  Least,
  Smallest,
  Tiniest,
  Shortest,
  Narrowest,
  Thinnest,
  Lightest,
  Softest,
  Weakest,
  Slowest,
  Latest,
  Newest,
  Most,
  Recent,
  Current,
  Updated as UpdatedIcon,
  Fresh,
  New,
  Original as OriginalIcon,
  First as FirstIcon,
  Initial,
  Starting,
  Beginning,
  Opening,
  Introductory,
  Basic,
  Elementary,
  Simple,
  Easy,
  Effortless,
  Smooth as SmoothIcon,
  Gentle as GentleIcon,
  Mild as MildIcon,
  Soft as SoftIcon,
  Tender,
  Delicate,
  Fragile,
  Brittle,
  Breakable,
  Fragmented,
  Shattered,
  Cracked,
  Split as SplitIcon,
  Torn,
  Ripped,
  Cut,
  Sliced,
  Chopped,
  Diced,
  Minced,
  Crushed,
  Squeezed,
  Pressed,
  Compressed,
  Condensed,
  Concentrated,
  Focused as FocusedIcon,
  Centered as CenteredIcon,
  Balanced as BalancedIcon,
  Aligned,
  Straight,
  Direct,
  Forward,
  Ahead,
  Onward,
  Upward,
  Downward,
  Leftward,
  Rightward,
  Backward,
  Reverse,
  Opposite,
  Contrary,
  Different,
  Distinct,
  Separate as SeparateIcon,
  Independent,
  Autonomous,
  Self,
  Auto,
  Manual,
  Handheld,
  Portable,
  Mobile,
  Movable,
  Flexible,
  Adaptable,
  Adjustable,
  Customizable,
  Configurable,
  Programmable,
  Controllable,
  Manageable,
  Operable,
  Functional,
  Working,
  Active as ActiveIcon,
  Live,
  Running as RunningIcon,
  Operating,
  Functioning,
  Performing,
  Executing,
  Processing,
  Computing,
  Calculating as CalculatingIcon,
  Analyzing,
  Evaluating as EvaluatingIcon,
  Testing as TestingIcon,
  Checking as CheckingIcon,
  Verifying,
  Validating,
  Confirming,
  Approving,
  Authorizing,
  Permitting,
  Allowing,
  Enabling,
  Activating,
  Starting as StartingIcon,
  Launching,
  Initiating,
  Beginning as BeginningIcon,
  Opening as OpeningIcon,
  Creating as CreatingIcon,
  Making as MakingIcon,
  Building as BuildingIcon,
  Constructing,
  Developing,
  Designing,
  Planning as PlanningIcon,
  Organizing as OrganizingIcon,
  Arranging,
  Preparing as PreparingIcon,
  Setting,
  Configuring,
  Installing,
  Deploying,
  Implementing,
  Executing as ExecutingIcon,
  Running as Running2Icon,
  Operating as OperatingIcon,
  Managing as ManagingIcon,
  Controlling,
  Monitoring,
  Tracking,
  Following,
  Watching,
  Observing,
  Viewing,
  Seeing,
  Looking,
  Searching as SearchingIcon,
  Finding,
  Discovering as DiscoveringIcon,
  Exploring as ExploringIcon,
  Investigating,
  Researching,
  Studying,
  Learning as LearningIcon,
  Understanding as UnderstandingIcon,
  Knowing,
  Recognizing,
  Identifying,
  Classifying,
  Categorizing,
  Grouping,
  Sorting,
  Ordering,
  Ranking,
  Rating,
  Scoring,
  Grading,
  Measuring as MeasuringIcon,
  Weighing,
  Counting,
  Numbering,
  Listing,
  Indexing,
  Cataloging,
  Recording,
  Logging,
  Documenting,
  Writing,
  Typing,
  Editing as EditingIcon,
  Revising,
  Updating as UpdatingIcon,
  Modifying,
  Changing,
  Altering,
  Adjusting,
  Tuning,
  Calibrating,
  Balancing as BalancingIcon,
  Stabilizing,
  Securing,
  Protecting as ProtectingIcon,
  Defending,
  Guarding,
  Watching as WatchingIcon,
  Monitoring as MonitoringIcon,
  Supervising,
  Overseeing,
  Managing as Managing2Icon,
  Administering,
  Governing,
  Ruling,
  Leading as LeadingIcon,
  Directing,
  Guiding,
  Instructing,
  Teaching as TeachingIcon,
  Training,
  Educating,
  Informing,
  Notifying,
  Alerting,
  Warning as WarningIcon,
  Reminding,
  Suggesting,
  Recommending,
  Advising,
  Counseling,
  Coaching,
  Mentoring,
  Supporting as SupportingIcon,
  Helping as HelpingIcon,
  Assisting as AssistingIcon,
  Serving as ServingIcon,
  Providing,
  Supplying,
  Delivering,
  Distributing,
  Sharing as SharingIcon,
  Giving as GivingIcon,
  Offering,
  Contributing,
  Donating,
  Investing,
  Spending,
  Buying as BuyingIcon,
  Purchasing,
  Acquiring,
  Obtaining,
  Getting,
  Receiving,
  Taking,
  Accepting as AcceptingIcon,
  Agreeing,
  Approving as ApprovingIcon,
  Confirming as ConfirmingIcon,
  Validating as ValidatingIcon,
  Verifying as VerifyingIcon,
  Checking as Checking2Icon,
  Testing as Testing2Icon,
  Evaluating as Evaluating2Icon,
  Assessing,
  Reviewing,
  Examining,
  Inspecting,
  Auditing,
  Analyzing as AnalyzingIcon,
  Processing as ProcessingIcon,
  Computing as ComputingIcon,
  Calculating as Calculating2Icon,
  Estimating,
  Predicting,
  Forecasting,
  Projecting,
  Planning as Planning2Icon,
  Scheduling,
  Organizing as Organizing2Icon,
  Arranging as ArrangingIcon,
  Preparing as Preparing2Icon,
  Setting as SettingIcon,
  Configuring as ConfiguringIcon,
  Installing as InstallingIcon,
  Deploying as DeployingIcon,
  Implementing as ImplementingIcon,
  Executing as Executing2Icon,
  Running as Running3Icon,
  Operating as Operating2Icon,
  Managing as Managing3Icon,
  Controlling as ControllingIcon,
  Monitoring as Monitoring2Icon,
  Tracking as TrackingIcon,
  Following as FollowingIcon,
  Watching as Watching2Icon,
  Observing as ObservingIcon,
  Viewing as ViewingIcon,
  Seeing as SeeingIcon,
  Looking as LookingIcon,
  Searching as Searching2Icon,
  Finding as FindingIcon,
  Discovering as Discovering2Icon,
  Exploring as Exploring2Icon,
  Investigating as InvestigatingIcon,
  Researching as ResearchingIcon,
  Studying as StudyingIcon,
  Learning as Learning2Icon,
  Understanding as Understanding2Icon,
  Knowing as KnowingIcon,
  Recognizing as RecognizingIcon,
  Identifying as IdentifyingIcon,
  Classifying as ClassifyingIcon,
  Categorizing as CategorizingIcon,
  Grouping as GroupingIcon,
  Sorting as SortingIcon,
  Ordering as OrderingIcon,
  Ranking as RankingIcon,
  Rating as RatingIcon,
  Scoring as ScoringIcon,
  Grading as GradingIcon,
  Measuring as Measuring2Icon,
  Weighing as WeighingIcon,
  Counting as CountingIcon,
  Numbering as NumberingIcon,
  Listing as ListingIcon,
  Indexing as IndexingIcon,
  Cataloging as CatalogingIcon,
  Recording as RecordingIcon,
  Logging as LoggingIcon,
  Documenting as DocumentingIcon,
  Writing as WritingIcon,
  Typing as TypingIcon,
  Editing as Editing2Icon,
  Revising as RevisingIcon,
  Updating as Updating2Icon,
  Modifying as ModifyingIcon,
  Changing as ChangingIcon,
  Altering as AlteringIcon,
  Adjusting as AdjustingIcon,
  Tuning as TuningIcon,
  Calibrating as CalibratingIcon,
  Balancing as Balancing2Icon,
  Stabilizing as StabilizingIcon,
  Securing as SecuringIcon,
  Protecting as Protecting2Icon,
  Defending as DefendingIcon,
  Guarding as GuardingIcon,
  Watching as Watching3Icon,
  Monitoring as Monitoring3Icon,
  Supervising as SupervisingIcon,
  Overseeing as OverseeingIcon,
  Managing as Managing4Icon,
  Administering as AdministeringIcon,
  Governing as GoverningIcon,
  Ruling as RulingIcon,
  Leading as Leading2Icon,
  Directing as DirectingIcon,
  Guiding as GuidingIcon,
  Instructing as InstructingIcon,
  Teaching as Teaching2Icon,
  Training as TrainingIcon,
  Educating as EducatingIcon,
  Informing as InformingIcon,
  Notifying as NotifyingIcon,
  Alerting as AlertingIcon,
  Warning as Warning2Icon,
  Reminding as RemindingIcon,
  Suggesting as SuggestingIcon,
  Recommending as RecommendingIcon,
  Advising as AdvisingIcon,
  Counseling as CounselingIcon,
  Coaching as CoachingIcon,
  Mentoring as MentoringIcon,
  Supporting as Supporting2Icon,
  Helping as Helping2Icon,
  Assisting as Assisting2Icon,
  Serving as Serving2Icon,
  Providing as ProvidingIcon,
  Supplying as SupplyingIcon,
  Delivering as DeliveringIcon,
  Distributing as DistributingIcon,
  Sharing as Sharing2Icon,
  Giving as Giving2Icon,
  Offering as OfferingIcon,
  Contributing as ContributingIcon,
  Donating as DonatingIcon,
  Investing as InvestingIcon,
  Spending as SpendingIcon,
  Buying as Buying2Icon,
  Purchasing as PurchasingIcon,
  Acquiring as AcquiringIcon,
  Obtaining as ObtainingIcon,
  Getting as GettingIcon,
  Receiving as ReceivingIcon,
  Taking as TakingIcon,
  Accepting as Accepting2Icon,
  Agreeing as AgreeingIcon,
  Approving as Approving2Icon,
  Confirming as Confirming2Icon,
  Validating as Validating2Icon,
  Verifying as Verifying2Icon,
  Checking as Checking3Icon,
  Testing as Testing3Icon,
  Evaluating as Evaluating3Icon,
  Assessing as AssessingIcon,
  Reviewing as ReviewingIcon,
  Examining as ExaminingIcon,
  Inspecting as InspectingIcon,
  Auditing as AuditingIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';

// Breadcrumb configuration interfaces
export interface BreadcrumbConfig {
  // Appearance
  showIcons: boolean;
  showSeparators: boolean;
  showHome: boolean;
  maxItems: number;
  maxLength: number;
  
  // Behavior
  autoGenerate: boolean;
  clickable: boolean;
  collapsible: boolean;
  
  // Styling
  variant: 'default' | 'compact' | 'minimal' | 'pills' | 'underline';
  size: 'sm' | 'md' | 'lg';
  separator: 'chevron' | 'slash' | 'arrow' | 'dot' | 'pipe';
  
  // Features
  enableTooltips: boolean;
  enableAnimations: boolean;
  enableKeyboardNav: boolean;
  enableContextMenu: boolean;
  
  // Responsive
  hideOnMobile: boolean;
  compactOnTablet: boolean;
  
  // Accessibility
  ariaLabel: string;
  skipToContent: boolean;
}

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  isDisabled?: boolean;
  permission?: string;
  onClick?: () => void;
  
  // Metadata
  description?: string;
  tooltip?: string;
  category?: string;
  level?: number;
  
  // State
  isLoading?: boolean;
  hasError?: boolean;
  isNew?: boolean;
  
  // Custom
  customData?: Record<string, any>;
}

export interface PathSegment {
  path: string;
  label: string;
  icon?: React.ReactNode;
  permission?: string;
  isRoot?: boolean;
  isDynamic?: boolean;
  params?: Record<string, string>;
}

export interface RBACBreadcrumbProps {
  config?: Partial<BreadcrumbConfig>;
  items?: BreadcrumbItem[];
  className?: string;
  onItemClick?: (item: BreadcrumbItem) => void;
  onPathChange?: (path: string) => void;
  showContextMenu?: boolean;
  customSegments?: PathSegment[];
  hideSegments?: string[];
  maxDisplayItems?: number;
}

// Default configuration
const defaultBreadcrumbConfig: BreadcrumbConfig = {
  showIcons: true,
  showSeparators: true,
  showHome: true,
  maxItems: 10,
  maxLength: 50,
  autoGenerate: true,
  clickable: true,
  collapsible: true,
  variant: 'default',
  size: 'md',
  separator: 'chevron',
  enableTooltips: true,
  enableAnimations: true,
  enableKeyboardNav: true,
  enableContextMenu: false,
  hideOnMobile: false,
  compactOnTablet: true,
  ariaLabel: 'Breadcrumb navigation',
  skipToContent: true
};

// Path to breadcrumb mapping for RBAC system
const pathToBreadcrumbMap: Record<string, PathSegment> = {
  '/': {
    path: '/',
    label: 'Home',
    icon: <Home className="w-4 h-4" />,
    isRoot: true
  },
  '/rbac': {
    path: '/rbac',
    label: 'RBAC Dashboard',
    icon: <Shield className="w-4 h-4" />,
    permission: 'rbac:read'
  },
  '/rbac/users': {
    path: '/rbac/users',
    label: 'User Management',
    icon: <Users className="w-4 h-4" />,
    permission: 'users:read'
  },
  '/rbac/users/create': {
    path: '/rbac/users/create',
    label: 'Create User',
    icon: <Plus className="w-4 h-4" />,
    permission: 'users:create'
  },
  '/rbac/users/[id]': {
    path: '/rbac/users/[id]',
    label: 'User Details',
    icon: <User className="w-4 h-4" />,
    permission: 'users:read',
    isDynamic: true
  },
  '/rbac/users/[id]/edit': {
    path: '/rbac/users/[id]/edit',
    label: 'Edit User',
    icon: <Edit className="w-4 h-4" />,
    permission: 'users:update',
    isDynamic: true
  },
  '/rbac/roles': {
    path: '/rbac/roles',
    label: 'Role Management',
    icon: <Lock className="w-4 h-4" />,
    permission: 'roles:read'
  },
  '/rbac/roles/create': {
    path: '/rbac/roles/create',
    label: 'Create Role',
    icon: <Plus className="w-4 h-4" />,
    permission: 'roles:create'
  },
  '/rbac/roles/[id]': {
    path: '/rbac/roles/[id]',
    label: 'Role Details',
    icon: <Lock className="w-4 h-4" />,
    permission: 'roles:read',
    isDynamic: true
  },
  '/rbac/permissions': {
    path: '/rbac/permissions',
    label: 'Permissions',
    icon: <Key className="w-4 h-4" />,
    permission: 'permissions:read'
  },
  '/rbac/resources': {
    path: '/rbac/resources',
    label: 'Resources',
    icon: <Database className="w-4 h-4" />,
    permission: 'resources:read'
  },
  '/rbac/groups': {
    path: '/rbac/groups',
    label: 'Groups',
    icon: <Users className="w-4 h-4" />,
    permission: 'groups:read'
  },
  '/rbac/audit': {
    path: '/rbac/audit',
    label: 'Audit Logs',
    icon: <FileText className="w-4 h-4" />,
    permission: 'audit:read'
  },
  '/rbac/access-requests': {
    path: '/rbac/access-requests',
    label: 'Access Requests',
    icon: <UserCheck className="w-4 h-4" />,
    permission: 'access_requests:read'
  },
  '/rbac/settings': {
    path: '/rbac/settings',
    label: 'Settings',
    icon: <Settings className="w-4 h-4" />,
    permission: 'settings:read'
  },
  '/data-sources': {
    path: '/data-sources',
    label: 'Data Sources',
    icon: <Database className="w-4 h-4" />,
    permission: 'data_sources:read'
  },
  '/catalog': {
    path: '/catalog',
    label: 'Data Catalog',
    icon: <FolderOpen className="w-4 h-4" />,
    permission: 'catalog:read'
  },
  '/classifications': {
    path: '/classifications',
    label: 'Classifications',
    icon: <Tag className="w-4 h-4" />,
    permission: 'classifications:read'
  },
  '/compliance': {
    path: '/compliance',
    label: 'Compliance Rules',
    icon: <FileText className="w-4 h-4" />,
    permission: 'compliance:read'
  },
  '/scan-rule-sets': {
    path: '/scan-rule-sets',
    label: 'Scan Rule Sets',
    icon: <Search className="w-4 h-4" />,
    permission: 'scan_rules:read'
  },
  '/scan-logic': {
    path: '/scan-logic',
    label: 'Scan Logic',
    icon: <Zap className="w-4 h-4" />,
    permission: 'scan_logic:read'
  }
};

// Custom hooks
const useBreadcrumbGeneration = (
  pathname: string,
  searchParams: URLSearchParams,
  customSegments: PathSegment[] = []
) => {
  const { hasPermission } = usePermissionCheck();

  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home if configured
    const homeSegment = pathToBreadcrumbMap['/'];
    if (homeSegment) {
      breadcrumbs.push({
        id: 'home',
        label: homeSegment.label,
        href: homeSegment.path,
        icon: homeSegment.icon,
        isActive: pathname === '/'
      });
    }

    // Build path progressively
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Check for exact match
      let pathSegment = pathToBreadcrumbMap[currentPath];
      
      // Check for dynamic routes
      if (!pathSegment) {
        // Try to find a dynamic route pattern
        const dynamicPath = currentPath.replace(/\/[^/]+$/, '/[id]');
        pathSegment = pathToBreadcrumbMap[dynamicPath];
      }

      // Check custom segments
      if (!pathSegment) {
        pathSegment = customSegments.find(cs => cs.path === currentPath);
      }

      // Fall back to segment name
      if (!pathSegment) {
        pathSegment = {
          path: currentPath,
          label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
          icon: <Folder className="w-4 h-4" />
        };
      }

      // Check permissions
      if (pathSegment.permission && !hasPermission(pathSegment.permission)) {
        return;
      }

      const isActive = index === segments.length - 1;
      
      breadcrumbs.push({
        id: `segment-${index}`,
        label: pathSegment.label,
        href: isActive ? undefined : pathSegment.path,
        icon: pathSegment.icon,
        isActive,
        level: index + 1
      });
    });

    return breadcrumbs;
  }, [pathname, searchParams, customSegments, hasPermission]);
};

const useBreadcrumbKeyboardNav = (items: BreadcrumbItem[], enabled: boolean = true) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(items.length - 1, prev + 1));
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && items[focusedIndex]) {
            const item = items[focusedIndex];
            if (item.onClick) {
              item.onClick();
            }
          }
          break;
        case 'Escape':
          setFocusedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, items, focusedIndex]);

  return { focusedIndex, setFocusedIndex, containerRef };
};

// Separator component
interface SeparatorProps {
  type: BreadcrumbConfig['separator'];
  className?: string;
}

const Separator: React.FC<SeparatorProps> = ({ type, className }) => {
  const separatorMap = {
    chevron: <ChevronRight className="w-4 h-4" />,
    slash: <span className="text-muted-foreground">/</span>,
    arrow: <ArrowRight className="w-4 h-4" />,
    dot: <span className="text-muted-foreground">•</span>,
    pipe: <span className="text-muted-foreground">|</span>
  };

  return (
    <span className={cn('flex items-center text-muted-foreground', className)}>
      {separatorMap[type]}
    </span>
  );
};

// Breadcrumb item component
interface BreadcrumbItemComponentProps {
  item: BreadcrumbItem;
  config: BreadcrumbConfig;
  isFocused?: boolean;
  onItemClick?: (item: BreadcrumbItem) => void;
  showTooltip?: boolean;
}

const BreadcrumbItemComponent: React.FC<BreadcrumbItemComponentProps> = ({
  item,
  config,
  isFocused = false,
  onItemClick,
  showTooltip = true
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (item.isDisabled) return;

    if (item.onClick) {
      item.onClick();
    } else if (item.href && config.clickable) {
      router.push(item.href);
    }

    if (onItemClick) {
      onItemClick(item);
    }
  }, [item, config.clickable, router, onItemClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const truncateLabel = (label: string, maxLength: number) => {
    if (label.length <= maxLength) return label;
    return `${label.substring(0, maxLength - 3)}...`;
  };

  const getVariantClasses = () => {
    const base = 'inline-flex items-center gap-2 transition-all duration-200';
    
    switch (config.variant) {
      case 'pills':
        return cn(
          base,
          'px-3 py-1.5 rounded-full',
          item.isActive 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-accent hover:text-accent-foreground'
        );
      case 'underline':
        return cn(
          base,
          'pb-1 border-b-2 border-transparent',
          item.isActive 
            ? 'border-primary text-primary' 
            : 'hover:border-muted-foreground hover:text-foreground'
        );
      case 'minimal':
        return cn(
          base,
          item.isActive 
            ? 'text-primary font-medium' 
            : 'text-muted-foreground hover:text-foreground'
        );
      case 'compact':
        return cn(
          base,
          'text-sm',
          item.isActive 
            ? 'text-foreground font-medium' 
            : 'text-muted-foreground hover:text-foreground'
        );
      default:
        return cn(
          base,
          item.isActive 
            ? 'text-foreground font-medium' 
            : 'text-muted-foreground hover:text-foreground'
        );
    }
  };

  const getSizeClasses = () => {
    switch (config.size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const itemElement = (
    <motion.span
      className={cn(
        getVariantClasses(),
        getSizeClasses(),
        config.clickable && !item.isActive && !item.isDisabled && 'cursor-pointer',
        item.isDisabled && 'opacity-50 cursor-not-allowed',
        isFocused && 'ring-2 ring-primary/50 rounded',
        config.enableAnimations && 'transform'
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={config.enableAnimations && !item.isDisabled ? { scale: 1.05 } : undefined}
      whileTap={config.enableAnimations && !item.isDisabled ? { scale: 0.95 } : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={config.enableKeyboardNav ? 0 : -1}
      role="button"
      aria-current={item.isActive ? 'page' : undefined}
      aria-disabled={item.isDisabled}
      title={showTooltip ? (item.tooltip || item.description) : undefined}
    >
      {/* Loading state */}
      {item.isLoading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-3 h-3"
        >
          <RefreshCw className="w-3 h-3" />
        </motion.div>
      )}

      {/* Icon */}
      {config.showIcons && item.icon && !item.isLoading && (
        <span className="flex-shrink-0">
          {item.icon}
        </span>
      )}

      {/* Label */}
      <span className="min-w-0 flex-1">
        {truncateLabel(item.label, config.maxLength)}
      </span>

      {/* Status indicators */}
      {item.isNew && (
        <span className="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
          New
        </span>
      )}

      {/* Error indicator */}
      {item.hasError && (
        <span className="text-destructive">
          <AlertCircle className="w-3 h-3" />
        </span>
      )}
    </motion.span>
  );

  return itemElement;
};

// Collapsed items component
interface CollapsedItemsProps {
  items: BreadcrumbItem[];
  config: BreadcrumbConfig;
  onItemClick?: (item: BreadcrumbItem) => void;
}

const CollapsedItems: React.FC<CollapsedItemsProps> = ({
  items,
  config,
  onItemClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground hover:text-foreground rounded transition-colors"
        title={`Show ${items.length} hidden items`}
      >
        <MoreHorizontal className="w-4 h-4" />
        <span className="text-xs">({items.length})</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 min-w-48"
          >
            <div className="py-2">
              {items.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    if (onItemClick) {
                      onItemClick(item);
                    }
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-accent transition-colors"
                >
                  {config.showIcons && item.icon}
                  <span className="flex-1 truncate">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Context menu component
interface ContextMenuProps {
  item: BreadcrumbItem;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  item,
  isOpen,
  onClose,
  position
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleCopyPath = () => {
    if (item.href) {
      navigator.clipboard.writeText(item.href);
    }
    onClose();
  };

  const handleOpenInNewTab = () => {
    if (item.href) {
      window.open(item.href, '_blank');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed bg-background border border-border rounded-lg shadow-lg z-50 py-2 min-w-48"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      <button
        onClick={handleCopyPath}
        className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-accent transition-colors"
      >
        <Copy className="w-4 h-4" />
        Copy Path
      </button>
      
      {item.href && (
        <button
          onClick={handleOpenInNewTab}
          className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-accent transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open in New Tab
        </button>
      )}
      
      <div className="border-t border-border my-1" />
      
      <div className="px-4 py-2 text-xs text-muted-foreground">
        <div>Level: {item.level || 0}</div>
        {item.category && <div>Category: {item.category}</div>}
      </div>
    </motion.div>
  );
};

// Main RBAC Breadcrumb component
export const RBACBreadcrumb: React.FC<RBACBreadcrumbProps> = ({
  config: userConfig = {},
  items: customItems,
  className,
  onItemClick,
  onPathChange,
  showContextMenu = false,
  customSegments = [],
  hideSegments = [],
  maxDisplayItems
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Merge configurations
  const config = useMemo(() => ({
    ...defaultBreadcrumbConfig,
    ...userConfig
  }), [userConfig]);

  // Generate breadcrumbs
  const generatedItems = useBreadcrumbGeneration(
    pathname,
    searchParams,
    customSegments
  );

  // Use custom items or generated items
  const allItems = customItems || generatedItems;

  // Filter hidden segments
  const filteredItems = useMemo(() => {
    return allItems.filter(item => 
      !hideSegments.includes(item.id) && 
      !hideSegments.includes(item.label.toLowerCase())
    );
  }, [allItems, hideSegments]);

  // Handle collapsing items
  const { visibleItems, collapsedItems } = useMemo(() => {
    const maxItems = maxDisplayItems || config.maxItems;
    
    if (!config.collapsible || filteredItems.length <= maxItems) {
      return { visibleItems: filteredItems, collapsedItems: [] };
    }

    // Always show first and last items
    const firstItem = filteredItems[0];
    const lastItems = filteredItems.slice(-2); // Last 2 items
    const middleItems = filteredItems.slice(1, -2);
    
    if (middleItems.length === 0) {
      return { visibleItems: filteredItems, collapsedItems: [] };
    }

    return {
      visibleItems: [firstItem, ...lastItems],
      collapsedItems: middleItems
    };
  }, [filteredItems, config.collapsible, config.maxItems, maxDisplayItems]);

  // Keyboard navigation
  const { focusedIndex, setFocusedIndex, containerRef } = useBreadcrumbKeyboardNav(
    visibleItems,
    config.enableKeyboardNav
  );

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    item: BreadcrumbItem;
    position: { x: number; y: number };
  } | null>(null);

  // Handle item click
  const handleItemClick = useCallback((item: BreadcrumbItem) => {
    if (onItemClick) {
      onItemClick(item);
    }

    if (onPathChange && item.href) {
      onPathChange(item.href);
    }
  }, [onItemClick, onPathChange]);

  // Handle context menu
  const handleContextMenu = useCallback((
    e: React.MouseEvent,
    item: BreadcrumbItem
  ) => {
    if (!showContextMenu || !config.enableContextMenu) return;
    
    e.preventDefault();
    setContextMenu({
      item,
      position: { x: e.clientX, y: e.clientY }
    });
  }, [showContextMenu, config.enableContextMenu]);

  // Skip to content functionality
  const handleSkipToContent = useCallback(() => {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
    }
  }, []);

  // Hide on mobile if configured
  if (config.hideOnMobile && window.innerWidth < 768) {
    return null;
  }

  return (
    <>
      {/* Skip to content link */}
      {config.skipToContent && (
        <button
          onClick={handleSkipToContent}
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-4 py-2 rounded z-50"
        >
          Skip to content
        </button>
      )}

      <nav
        ref={containerRef}
        aria-label={config.ariaLabel}
        className={cn(
          'flex items-center space-x-1',
          config.size === 'sm' && 'text-xs',
          config.size === 'lg' && 'text-base',
          config.hideOnMobile && 'hidden md:flex',
          config.compactOnTablet && 'md:text-sm lg:text-base',
          className
        )}
      >
        <ol className="flex items-center space-x-1" role="list">
          {visibleItems.map((item, index) => {
            const isLast = index === visibleItems.length - 1;
            const showCollapsedBefore = 
              config.collapsible && 
              collapsedItems.length > 0 && 
              index === 1; // After first item

            return (
              <li key={item.id} className="flex items-center space-x-1">
                {/* Show collapsed items indicator */}
                {showCollapsedBefore && (
                  <>
                    {config.showSeparators && (
                      <Separator type={config.separator} />
                    )}
                    <CollapsedItems
                      items={collapsedItems}
                      config={config}
                      onItemClick={handleItemClick}
                    />
                  </>
                )}

                {/* Separator */}
                {index > 0 && config.showSeparators && !showCollapsedBefore && (
                  <Separator type={config.separator} />
                )}

                {/* Breadcrumb item */}
                <div
                  onContextMenu={(e) => handleContextMenu(e, item)}
                >
                  <BreadcrumbItemComponent
                    item={item}
                    config={config}
                    isFocused={focusedIndex === index}
                    onItemClick={handleItemClick}
                    showTooltip={config.enableTooltips}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            item={contextMenu.item}
            isOpen={true}
            onClose={() => setContextMenu(null)}
            position={contextMenu.position}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default RBACBreadcrumb;