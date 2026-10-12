import React, { useState, useEffect, useRef } from 'react';
import { CricketFormat, Match, Player, PlayerRole, SportType, Team } from '../types/sports';
import { createMatch } from '../services/api';
import {
  ArrowLeft,
  Check,
  Trophy,
  Users,
  Shield,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  ArrowLeftRight,
  Upload,
  Bookmark,
  BookmarkCheck,
  FolderOpen,
  Zap,
  Star,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface CreateMatchProps {
  onMatchCreated: (matchId: string, sport: SportType) => void;
  onCancel: () => void;
}

interface SavedCustomTeam {
  name: string;
  shortName: string;
  color: string;
  secondaryColor?: string;
  logoUrl?: string;
  squad: Player[];
}

const PRESET_LOGOS = [
  { id: 'lion', label: 'Golden Lion', url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=120&auto=format&fit=crop&q=70' },
  { id: 'eagle', label: 'Thunder Eagle', url: 'https://images.unsplash.com/photo-1611689342806-0863700ce8e4?w=120&auto=format&fit=crop&q=70' },
  { id: 'panther', label: 'Black Panther', url: 'https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?w=120&auto=format&fit=crop&q=70' },
  { id: 'phoenix', label: 'Fire Phoenix', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=120&auto=format&fit=crop&q=70' },
  { id: 'titan', label: 'Titan Shield', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=120&auto=format&fit=crop&q=70' },
  { id: 'shark', label: 'Apex Shark', url: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=120&auto=format&fit=crop&q=70' },
  { id: 'bull', label: 'Raging Bull', url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=120&auto=format&fit=crop&q=70' },
  { id: 'wolf', label: 'Cyber Wolf', url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=120&auto=format&fit=crop&q=70' },
];

const COLOR_SWATCHES = [
  { label: 'Cyan', color: '#06b6d4' },
  { label: 'Sky', color: '#38bdf8' },
  { label: 'Royal Blue', color: '#1e40af' },
  { label: 'Crimson', color: '#dc2626' },
  { label: 'Solar Gold', color: '#eab308' },
  { label: 'Emerald', color: '#10b981' },
  { label: 'Purple', color: '#8b5cf6' },
  { label: 'Orange', color: '#ea580c' },
  { label: 'Obsidian', color: '#0f172a' },
  { label: 'Silver', color: '#f8fafc' },
];

export const generateTeamCrestSvg = (shortName: string, primaryColor: string, secondaryColor: string): string => {
  const initials = (shortName || 'TM').slice(0, 3).toUpperCase();
  const c1 = primaryColor || '#06b6d4';
  const c2 = secondaryColor || '#1e3a8a';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="grad_${initials}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
    </defs>
    <polygon points="50,4 92,20 84,72 50,96 16,72 8,20" fill="url(#grad_${initials})" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="50,10 86,24 78,68 50,90 22,68 14,24" fill="rgba(0,0,0,0.3)" />
    <text x="50" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="${initials.length > 2 ? '22' : '26'}" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const DEFAULT_VAULT_TEAMS: SavedCustomTeam[] = [
  {
    name: 'India Champions',
    shortName: 'IND',
    color: '#1e40af',
    secondaryColor: '#ea580c',
    logoUrl: PRESET_LOGOS[0].url,
    squad: [
      { id: 'sq_1', name: 'Rohit Sharma', role: 'batter', number: 45, isCaptain: true },
      { id: 'sq_2', name: 'Virat Kohli', role: 'batter', number: 18 },
      { id: 'sq_3', name: 'Suryakumar Yadav', role: 'batter', number: 63 },
      { id: 'sq_4', name: 'Sanju Samson', role: 'wicketkeeper', number: 9 },
      { id: 'sq_5', name: 'Hardik Pandya', role: 'all-rounder', number: 33, isViceCaptain: true },
      { id: 'sq_6', name: 'Axar Patel', role: 'all-rounder', number: 20 },
      { id: 'sq_7', name: 'Jasprit Bumrah', role: 'bowler', number: 93 },
      { id: 'sq_8', name: 'Kuldeep Yadav', role: 'bowler', number: 23 },
      { id: 'sq_9', name: 'Arshdeep Singh', role: 'bowler', number: 2 },
      { id: 'sq_10', name: 'Mohammed Siraj', role: 'bowler', number: 13 },
      { id: 'sq_11', name: 'Rinku Singh', role: 'batter', number: 35 },
    ],
  },
  {
    name: 'Australia Gold',
    shortName: 'AUS',
    color: '#eab308',
    secondaryColor: '#15803d',
    logoUrl: PRESET_LOGOS[1].url,
    squad: [
      { id: 'sq_b1', name: 'Travis Head', role: 'batter', number: 62 },
      { id: 'sq_b2', name: 'David Warner', role: 'batter', number: 31 },
      { id: 'sq_b3', name: 'Mitchell Marsh', role: 'all-rounder', number: 8, isCaptain: true },
      { id: 'sq_b4', name: 'Glenn Maxwell', role: 'all-rounder', number: 32 },
      { id: 'sq_b5', name: 'Marcus Stoinis', role: 'all-rounder', number: 17 },
      { id: 'sq_b6', name: 'Tim David', role: 'batter', number: 85 },
      { id: 'sq_b7', name: 'Matthew Wade', role: 'wicketkeeper', number: 13 },
      { id: 'sq_b8', name: 'Pat Cummins', role: 'bowler', number: 30, isViceCaptain: true },
      { id: 'sq_b9', name: 'Mitchell Starc', role: 'bowler', number: 56 },
      { id: 'sq_b10', name: 'Adam Zampa', role: 'bowler', number: 88 },
      { id: 'sq_b11', name: 'Josh Hazlewood', role: 'bowler', number: 38 },
    ],
  },
  {
    name: 'Puneri Paltan',
    shortName: 'PUN',
    color: '#ea580c',
    secondaryColor: '#1e293b',
    logoUrl: PRESET_LOGOS[2].url,
    squad: [
      { id: 'pk_1', name: 'Aslam Inamdar', role: 'all-rounder', number: 7, isCaptain: true },
      { id: 'pk_2', name: 'Mohit Goyat', role: 'raider', number: 11 },
      { id: 'pk_3', name: 'Pankaj Mohite', role: 'raider', number: 9 },
      { id: 'pk_4', name: 'Mohammadreza Shadloui', role: 'defender', number: 1, isViceCaptain: true },
      { id: 'pk_5', name: 'Gaurav Khatri', role: 'defender', number: 5 },
      { id: 'pk_6', name: 'Abhinesh Nadarajan', role: 'defender', number: 3 },
      { id: 'pk_7', name: 'Sanket Sawant', role: 'defender', number: 4 },
    ],
  },
  {
    name: 'Patna Pirates',
    shortName: 'PAT',
    color: '#15803d',
    secondaryColor: '#eab308',
    logoUrl: PRESET_LOGOS[4].url,
    squad: [
      { id: 'pat_1', name: 'Sachin Tanwar', role: 'raider', number: 10, isCaptain: true },
      { id: 'pat_2', name: 'Manjeet Dahiya', role: 'raider', number: 8 },
      { id: 'pat_3', name: 'M. Sudhakar', role: 'raider', number: 14 },
      { id: 'pat_4', name: 'Krishan Dhull', role: 'defender', number: 2 },
      { id: 'pat_5', name: 'Ankit Jaglan', role: 'defender', number: 6 },
      { id: 'pat_6', name: 'Manish Dhull', role: 'defender', number: 12 },
      { id: 'pat_7', name: 'Babu M', role: 'defender', number: 15 },
    ],
  },
];

const SPORT_CONFIGS: Record<
  SportType,
  {
    name: string;
    tournament: string;
    matchName: string;
    venue: string;
    defaultSquadSize: number;
    teamA: { name: string; short: string; color: string; secondaryColor: string; squad: string[] };
    teamB: { name: string; short: string; color: string; secondaryColor: string; squad: string[] };
  }
> = {
  cricket: {
    name: 'Cricket',
    tournament: "ICC Men's T20 World Cup 2026",
    matchName: 'India vs Australia - Championship Final',
    venue: 'Melbourne Cricket Ground, Australia',
    defaultSquadSize: 11,
    teamA: {
      name: 'India Champions',
      short: 'IND',
      color: '#1e40af',
      secondaryColor: '#ea580c',
      squad: ['Rohit Sharma', 'Virat Kohli', 'Suryakumar Yadav', 'Sanju Samson', 'Hardik Pandya', 'Axar Patel', 'Jasprit Bumrah', 'Kuldeep Yadav', 'Arshdeep Singh', 'Mohammed Siraj', 'Rinku Singh'],
    },
    teamB: {
      name: 'Australia Gold',
      short: 'AUS',
      color: '#eab308',
      secondaryColor: '#15803d',
      squad: ['Travis Head', 'David Warner', 'Mitchell Marsh', 'Glenn Maxwell', 'Marcus Stoinis', 'Tim David', 'Matthew Wade', 'Pat Cummins', 'Mitchell Starc', 'Adam Zampa', 'Josh Hazlewood'],
    },
  },
  kabaddi: {
    name: 'Kabaddi',
    tournament: 'Pro Kabaddi League 2026 Grand Final',
    matchName: 'Puneri Paltan vs Patna Pirates',
    venue: 'Gachibowli Indoor Stadium, Hyderabad',
    defaultSquadSize: 7,
    teamA: {
      name: 'Puneri Paltan',
      short: 'PUN',
      color: '#ea580c',
      secondaryColor: '#1e293b',
      squad: ['Aslam Inamdar', 'Mohit Goyat', 'Pankaj Mohite', 'Mohammadreza Shadloui', 'Gaurav Khatri', 'Abhinesh Nadarajan', 'Sanket Sawant'],
    },
    teamB: {
      name: 'Patna Pirates',
      short: 'PAT',
      color: '#15803d',
      secondaryColor: '#eab308',
      squad: ['Sachin Tanwar', 'Manjeet Dahiya', 'M. Sudhakar', 'Krishan Dhull', 'Ankit Jaglan', 'Manish Dhull', 'Babu M'],
    },
  },
  football: {
    name: 'Football',
    tournament: 'UEFA Champions League Final',
    matchName: 'Real Madrid vs Manchester City',
    venue: 'Santiago Bernabéu, Madrid',
    defaultSquadSize: 11,
    teamA: {
      name: 'Real Madrid',
      short: 'RMA',
      color: '#ffffff',
      secondaryColor: '#1e3a8a',
      squad: ['Thibaut Courtois', 'Dani Carvajal', 'Antonio Rüdiger', 'Éder Militão', 'Ferland Mendy', 'Federico Valverde', 'Jude Bellingham', 'Aurélien Tchouaméni', 'Rodrygo', 'Vinícius Júnior', 'Kylian Mbappé'],
    },
    teamB: {
      name: 'Manchester City',
      short: 'MCI',
      color: '#38bdf8',
      secondaryColor: '#1e293b',
      squad: ['Ederson', 'Kyle Walker', 'Rúben Dias', 'Manuel Akanji', 'Joško Gvardiol', 'Rodri', 'Kevin De Bruyne', 'Bernardo Silva', 'Phil Foden', 'Jack Grealish', 'Erling Haaland'],
    },
  },
  basketball: {
    name: 'Basketball',
    tournament: 'NBA Western Conference Finals',
    matchName: 'Los Angeles Lakers vs Golden State Warriors',
    venue: 'Crypto.com Arena, Los Angeles',
    defaultSquadSize: 5,
    teamA: {
      name: 'Los Angeles Lakers',
      short: 'LAL',
      color: '#eab308',
      secondaryColor: '#7c3aed',
      squad: ["D'Angelo Russell", 'Austin Reaves', 'LeBron James', 'Rui Hachimura', 'Anthony Davis'],
    },
    teamB: {
      name: 'Golden State Warriors',
      short: 'GSW',
      color: '#2563EB',
      secondaryColor: '#facc15',
      squad: ['Stephen Curry', 'Brandin Podziemski', 'Andrew Wiggins', 'Jonathan Kuminga', 'Draymond Green'],
    },
  },
  tennis: {
    name: 'Tennis',
    tournament: 'Wimbledon Championships Final',
    matchName: 'Carlos Alcaraz vs Jannik Sinner',
    venue: 'Centre Court, All England Club',
    defaultSquadSize: 1,
    teamA: { name: 'Carlos Alcaraz', short: 'ALC', color: '#10b981', secondaryColor: '#0f172a', squad: ['Carlos Alcaraz'] },
    teamB: { name: 'Jannik Sinner', short: 'SIN', color: '#3b82f6', secondaryColor: '#f97316', squad: ['Jannik Sinner'] },
  },
  badminton: {
    name: 'Badminton',
    tournament: 'BWF World Tour Super 1000',
    matchName: 'Viktor Axelsen vs Lakshya Sen',
    venue: 'Istora Senayan, Jakarta',
    defaultSquadSize: 1,
    teamA: { name: 'Viktor Axelsen', short: 'AXE', color: '#dc2626', secondaryColor: '#ffffff', squad: ['Viktor Axelsen'] },
    teamB: { name: 'Lakshya Sen', short: 'SEN', color: '#2563eb', secondaryColor: '#ea580c', squad: ['Lakshya Sen'] },
  },
  table_tennis: {
    name: 'Table Tennis',
    tournament: 'WTT Grand Smash Championship',
    matchName: 'Fan Zhendong vs Ma Long',
    venue: 'Singapore Sports Hub',
    defaultSquadSize: 1,
    teamA: { name: 'Fan Zhendong', short: 'FAN', color: '#dc2626', secondaryColor: '#facc15', squad: ['Fan Zhendong'] },
    teamB: { name: 'Ma Long', short: 'MA', color: '#eab308', secondaryColor: '#dc2626', squad: ['Ma Long'] },
  },
  volleyball: {
    name: 'Volleyball',
    tournament: 'FIVB Nations League Final',
    matchName: 'Poland vs Italy',
    venue: 'Ergo Arena, Gdansk',
    defaultSquadSize: 6,
    teamA: { name: 'Poland', short: 'POL', color: '#dc2626', secondaryColor: '#ffffff', squad: ['B. Kurek', 'W. Leon', 'M. Bieniek', 'A. Sliwka', 'G. Lomacz', 'P. Zatorski'] },
    teamB: { name: 'Italy', short: 'ITA', color: '#2563eb', secondaryColor: '#ffffff', squad: ['S. Giannelli', 'A. Michieletto', 'D. Lavia', 'Y. Romano', 'G. Galassi', 'F. Balaso'] },
  },
  field_hockey: {
    name: 'Field Hockey',
    tournament: 'FIH Hockey Pro League',
    matchName: 'India vs Netherlands',
    venue: 'Birsa Munda Stadium, Rourkela',
    defaultSquadSize: 11,
    teamA: { name: 'India', short: 'IND', color: '#2563eb', secondaryColor: '#ea580c', squad: ['PR Sreejesh', 'Harmanpreet Singh', 'Manpreet Singh', 'Hardik Singh', 'Mandeep Singh', 'Amit Rohidas'] },
    teamB: { name: 'Netherlands', short: 'NED', color: '#ea580c', secondaryColor: '#ffffff', squad: ['Pirmin Blaak', 'Jip Janssen', 'Thierry Brinkman', 'Terrance Pieters', 'Floris Wortelboer', 'Jonas de Geus'] },
  },
  baseball: {
    name: 'Baseball',
    tournament: 'MLB World Series',
    matchName: 'New York Yankees vs LA Dodgers',
    venue: 'Yankee Stadium, New York',
    defaultSquadSize: 9,
    teamA: { name: 'NY Yankees', short: 'NYY', color: '#1e3a8a', secondaryColor: '#ffffff', squad: ['Aaron Judge', 'Juan Soto', 'Giancarlo Stanton', 'Gerrit Cole', 'Anthony Volpe', 'Alex Verdugo'] },
    teamB: { name: 'LA Dodgers', short: 'LAD', color: '#2563eb', secondaryColor: '#ffffff', squad: ['Shohei Ohtani', 'Mookie Betts', 'Freddie Freeman', 'Yoshinobu Yamamoto', 'Teoscar Hernandez', 'Will Smith'] },
  },
  rugby: {
    name: 'Rugby Union',
    tournament: 'Six Nations Championship',
    matchName: 'Ireland vs France',
    venue: 'Aviva Stadium, Dublin',
    defaultSquadSize: 15,
    teamA: { name: 'Ireland', short: 'IRE', color: '#16a34a', secondaryColor: '#ffffff', squad: ['Caelan Doris', 'James Lowe', 'Bundee Aki', 'Jamison Gibson-Park', 'Andrew Porter', 'Dan Sheehan'] },
    teamB: { name: 'France', short: 'FRA', color: '#1d4ed8', secondaryColor: '#ffffff', squad: ['Antoine Dupont', 'Romain Ntamack', 'Thomas Ramos', 'Damian Penaud', 'Gregory Alldritt', 'Peato Mauvaka'] },
  },
};

const deriveShortCode = (name: string): string => {
  const cleaned = name.trim();
  if (!cleaned) return 'TM';
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) {
    return parts.map((p) => p[0]).join('').slice(0, 4).toUpperCase();
  }
  return cleaned.slice(0, 3).toUpperCase();
};

export const CreateMatch: React.FC<CreateMatchProps> = ({ onMatchCreated, onCancel }) => {
  const [sport, setSport] = useState<SportType>('cricket');
  const [tournament, setTournament] = useState(SPORT_CONFIGS.cricket.tournament);
  const [matchName, setMatchName] = useState(SPORT_CONFIGS.cricket.matchName);
  const [venue, setVenue] = useState(SPORT_CONFIGS.cricket.venue);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('19:00');
  const [cricketFormat, setCricketFormat] = useState<CricketFormat>('T20');
  const [customOvers, setCustomOvers] = useState(20);
  const [autoMatchName, setAutoMatchName] = useState(true);

  // Saved Teams Vault in localStorage
  const [vaultTeams, setVaultTeams] = useState<SavedCustomTeam[]>(() => {
    try {
      const stored = localStorage.getItem('marketinGlu_saved_teams');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_VAULT_TEAMS;
  });

  // Team A State
  const [teamAName, setTeamAName] = useState(SPORT_CONFIGS.cricket.teamA.name);
  const [teamAShort, setTeamAShort] = useState(SPORT_CONFIGS.cricket.teamA.short);
  const [teamAColor, setTeamAColor] = useState(SPORT_CONFIGS.cricket.teamA.color);
  const [teamASecondary, setTeamASecondary] = useState(SPORT_CONFIGS.cricket.teamA.secondaryColor);
  const [teamALogoUrl, setTeamALogoUrl] = useState(PRESET_LOGOS[0].url);
  const [teamASquad, setTeamASquad] = useState<Player[]>(
    SPORT_CONFIGS.cricket.teamA.squad.map((name, i) => ({
      id: `p_a_${i + 1}`,
      name,
      role: i < 4 ? 'batter' : i < 6 ? 'all-rounder' : i === 6 ? 'wicketkeeper' : 'bowler',
      number: i + 1,
      isCaptain: i === 0,
      isViceCaptain: i === 4,
    }))
  );

  // Team B State
  const [teamBName, setTeamBName] = useState(SPORT_CONFIGS.cricket.teamB.name);
  const [teamBShort, setTeamBShort] = useState(SPORT_CONFIGS.cricket.teamB.short);
  const [teamBColor, setTeamBColor] = useState(SPORT_CONFIGS.cricket.teamB.color);
  const [teamBSecondary, setTeamBSecondary] = useState(SPORT_CONFIGS.cricket.teamB.secondaryColor);
  const [teamBLogoUrl, setTeamBLogoUrl] = useState(PRESET_LOGOS[1].url);
  const [teamBSquad, setTeamBSquad] = useState<Player[]>(
    SPORT_CONFIGS.cricket.teamB.squad.map((name, i) => ({
      id: `p_b_${i + 1}`,
      name,
      role: i < 4 ? 'batter' : i < 6 ? 'all-rounder' : i === 6 ? 'wicketkeeper' : 'bowler',
      number: i + 1,
      isCaptain: i === 2,
      isViceCaptain: i === 7,
    }))
  );

  // Squad Management Tab & Input States
  const [activeSquadTab, setActiveSquadTab] = useState<'teamA' | 'teamB'>('teamA');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<PlayerRole>('batter');
  const [newPlayerNumber, setNewPlayerNumber] = useState<number>(1);
  const [newPlayerIsCaptain, setNewPlayerIsCaptain] = useState(false);
  const [newPlayerIsViceCaptain, setNewPlayerIsViceCaptain] = useState(false);

  // Bulk Player Import Drawer / Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Logo preset modal / selector
  const [logoPickerTarget, setLogoPickerTarget] = useState<'teamA' | 'teamB' | null>(null);

  // File Input Refs for local image upload
  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Auto-synchronize match headline if autoMatchName is enabled
  useEffect(() => {
    if (autoMatchName) {
      setMatchName(`${teamAName || 'Team A'} vs ${teamBName || 'Team B'}`);
    }
  }, [teamAName, teamBName, autoMatchName]);

  const handleSportChange = (newSport: SportType) => {
    setSport(newSport);
    const cfg = SPORT_CONFIGS[newSport];
    if (cfg) {
      setTournament(cfg.tournament);
      setVenue(cfg.venue);
      setTeamAName(cfg.teamA.name);
      setTeamAShort(cfg.teamA.short);
      setTeamAColor(cfg.teamA.color);
      setTeamASecondary(cfg.teamA.secondaryColor);
      setTeamBName(cfg.teamB.name);
      setTeamBShort(cfg.teamB.short);
      setTeamBColor(cfg.teamB.color);
      setTeamBSecondary(cfg.teamB.secondaryColor);

      // Default squad roles per sport
      setTeamASquad(
        cfg.teamA.squad.map((name, i) => ({
          id: `p_a_${Date.now()}_${i + 1}`,
          name,
          role: getDefaultRoleForSport(newSport, i),
          number: i + 1,
          isCaptain: i === 0,
          isViceCaptain: i === 1,
        }))
      );

      setTeamBSquad(
        cfg.teamB.squad.map((name, i) => ({
          id: `p_b_${Date.now()}_${i + 1}`,
          name,
          role: getDefaultRoleForSport(newSport, i),
          number: i + 1,
          isCaptain: i === 0,
          isViceCaptain: i === 1,
        }))
      );

      if (autoMatchName) {
        setMatchName(`${cfg.teamA.name} vs ${cfg.teamB.name}`);
      }
    }
  };

  const getDefaultRoleForSport = (s: SportType, index: number): PlayerRole => {
    if (s === 'cricket') return index < 4 ? 'batter' : index < 6 ? 'all-rounder' : index === 6 ? 'wicketkeeper' : 'bowler';
    if (s === 'kabaddi') return index < 3 ? 'raider' : index < 5 ? 'all-rounder' : 'defender';
    if (s === 'football') return index === 0 ? 'goalkeeper' : index < 4 ? 'defender' : index < 7 ? 'midfielder' : 'forward';
    if (s === 'basketball') return index === 0 ? 'guard' : index < 3 ? 'forward' : 'center';
    return 'player';
  };

  // 1-Click Swap Home and Away Teams (Removes all tedious retyping!)
  const handleSwapTeams = () => {
    const tempName = teamAName;
    const tempShort = teamAShort;
    const tempColor = teamAColor;
    const tempSec = teamASecondary;
    const tempLogo = teamALogoUrl;
    const tempSquad = teamASquad;

    setTeamAName(teamBName);
    setTeamAShort(teamBShort);
    setTeamAColor(teamBColor);
    setTeamASecondary(teamBSecondary);
    setTeamALogoUrl(teamBLogoUrl);
    setTeamASquad(teamBSquad);

    setTeamBName(tempName);
    setTeamBShort(tempShort);
    setTeamBColor(tempColor);
    setTeamBSecondary(tempSec);
    setTeamBLogoUrl(tempLogo);
    setTeamBSquad(tempSquad);
  };

  // Save Custom Team to Vault
  const handleSaveTeamToVault = (team: 'teamA' | 'teamB') => {
    const targetName = team === 'teamA' ? teamAName : teamBName;
    const targetShort = team === 'teamA' ? teamAShort : teamBShort;
    const targetColor = team === 'teamA' ? teamAColor : teamBColor;
    const targetSec = team === 'teamA' ? teamASecondary : teamBSecondary;
    const targetLogo = team === 'teamA' ? teamALogoUrl : teamBLogoUrl;
    const targetSquad = team === 'teamA' ? teamASquad : teamBSquad;

    const newTeam: SavedCustomTeam = {
      name: targetName,
      shortName: targetShort,
      color: targetColor,
      secondaryColor: targetSec,
      logoUrl: targetLogo,
      squad: targetSquad,
    };

    const updated = [newTeam, ...vaultTeams.filter((t) => t.name !== targetName)];
    setVaultTeams(updated);
    try {
      localStorage.setItem('marketinGlu_saved_teams', JSON.stringify(updated));
    } catch {}
    setSaveSuccessMsg(`Saved "${targetName}" to Custom Teams Vault!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Load Team from Vault
  const handleLoadVaultTeam = (team: 'teamA' | 'teamB', vaultTeam: SavedCustomTeam) => {
    if (team === 'teamA') {
      setTeamAName(vaultTeam.name);
      setTeamAShort(vaultTeam.shortName);
      setTeamAColor(vaultTeam.color);
      setTeamASecondary(vaultTeam.secondaryColor || '#ffffff');
      if (vaultTeam.logoUrl) setTeamALogoUrl(vaultTeam.logoUrl);
      setTeamASquad(vaultTeam.squad);
    } else {
      setTeamBName(vaultTeam.name);
      setTeamBShort(vaultTeam.shortName);
      setTeamBColor(vaultTeam.color);
      setTeamBSecondary(vaultTeam.secondaryColor || '#ffffff');
      if (vaultTeam.logoUrl) setTeamBLogoUrl(vaultTeam.logoUrl);
      setTeamBSquad(vaultTeam.squad);
    }
  };

  // Handle Local File Upload for Team Logo (Converts to Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'teamA' | 'teamB') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size exceeds 2MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (target === 'teamA') setTeamALogoUrl(dataUrl);
        else setTeamBLogoUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate Instant Vector SVG Shield for Team
  const handleGenerateSvgLogo = (target: 'teamA' | 'teamB') => {
    const sName = target === 'teamA' ? teamAShort : teamBShort;
    const pCol = target === 'teamA' ? teamAColor : teamBColor;
    const sCol = target === 'teamA' ? teamASecondary : teamBSecondary;
    const svgUrl = generateTeamCrestSvg(sName, pCol, sCol);
    if (target === 'teamA') setTeamALogoUrl(svgUrl);
    else setTeamBLogoUrl(svgUrl);
  };

  // Add Single Player
  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    const newP: Player = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newPlayerName.trim(),
      role: newPlayerRole,
      number: newPlayerNumber || (activeSquadTab === 'teamA' ? teamASquad.length + 1 : teamBSquad.length + 1),
      isCaptain: newPlayerIsCaptain,
      isViceCaptain: newPlayerIsViceCaptain,
    };

    if (activeSquadTab === 'teamA') {
      setTeamASquad((prev) => [...prev, newP]);
    } else {
      setTeamBSquad((prev) => [...prev, newP]);
    }

    setNewPlayerName('');
    setNewPlayerNumber((prev) => prev + 1);
    setNewPlayerIsCaptain(false);
    setNewPlayerIsViceCaptain(false);
  };

  // Remove Player
  const handleRemovePlayer = (team: 'teamA' | 'teamB', playerId: string) => {
    if (team === 'teamA') {
      setTeamASquad((prev) => prev.filter((p) => p.id !== playerId));
    } else {
      setTeamBSquad((prev) => prev.filter((p) => p.id !== playerId));
    }
  };

  // Toggle Captain / Vice-Captain
  const handleToggleBadge = (team: 'teamA' | 'teamB', playerId: string, type: 'captain' | 'vice') => {
    const setter = team === 'teamA' ? setTeamASquad : setTeamBSquad;
    setter((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          if (type === 'captain') return { ...p, isCaptain: !p.isCaptain, isViceCaptain: false };
          return { ...p, isViceCaptain: !p.isViceCaptain, isCaptain: false };
        }
        if (type === 'captain' && p.isCaptain) return { ...p, isCaptain: false };
        if (type === 'vice' && p.isViceCaptain) return { ...p, isViceCaptain: false };
        return p;
      })
    );
  };

  // Bulk Player Import (Paste list to add in 2 seconds)
  const handleImportBulkPlayers = () => {
    if (!bulkText.trim()) return;
    const rawLines = bulkText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const startNum = activeSquadTab === 'teamA' ? teamASquad.length + 1 : teamBSquad.length + 1;
    const createdPlayers: Player[] = rawLines.map((name, idx) => ({
      id: `p_bulk_${Date.now()}_${idx + 1}`,
      name,
      role: getDefaultRoleForSport(sport, idx),
      number: startNum + idx,
      isCaptain: startNum + idx === 1,
    }));

    if (activeSquadTab === 'teamA') {
      setTeamASquad((prev) => [...prev, ...createdPlayers]);
    } else {
      setTeamBSquad((prev) => [...prev, ...createdPlayers]);
    }

    setBulkText('');
    setShowBulkModal(false);
  };

  // Auto Generate Standard Roster for chosen Sport
  const handleGenerateStandardRoster = (team: 'teamA' | 'teamB') => {
    const count = SPORT_CONFIGS[sport]?.defaultSquadSize || 11;
    const teamPrefix = team === 'teamA' ? teamAName || 'Team A' : teamBName || 'Team B';
    const generated: Player[] = Array.from({ length: count }, (_, i) => ({
      id: `p_gen_${Date.now()}_${i + 1}`,
      name: `${teamPrefix} Player ${i + 1}`,
      role: getDefaultRoleForSport(sport, i),
      number: i + 1,
      isCaptain: i === 0,
      isViceCaptain: i === 1,
    }));

    if (team === 'teamA') setTeamASquad(generated);
    else setTeamBSquad(generated);
  };

  // Clear Squad with 1 click
  const handleClearSquad = (team: 'teamA' | 'teamB') => {
    if (confirm(`Clear all players for ${team === 'teamA' ? teamAName : teamBName}?`)) {
      if (team === 'teamA') setTeamASquad([]);
      else setTeamBSquad([]);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const teamAData: Team = {
        id: `team_${Date.now()}_a`,
        name: teamAName.trim() || 'Team A',
        shortName: (teamAShort.trim() || deriveShortCode(teamAName)).toUpperCase(),
        color: teamAColor,
        secondaryColor: teamASecondary,
        logoUrl: teamALogoUrl,
        squad: teamASquad,
      };

      const teamBData: Team = {
        id: `team_${Date.now()}_b`,
        name: teamBName.trim() || 'Team B',
        shortName: (teamBShort.trim() || deriveShortCode(teamBName)).toUpperCase(),
        color: teamBColor,
        secondaryColor: teamBSecondary,
        logoUrl: teamBLogoUrl,
        squad: teamBSquad,
      };

      const initialMatch: Partial<Match> = {
        name: matchName.trim() || `${teamAData.name} vs ${teamBData.name}`,
        sport,
        tournament,
        venue,
        date,
        startTime,
        status: 'live',
        teamA: teamAData,
        teamB: teamBData,
      };

      // Initialize Cricket State if Cricket
      if (sport === 'cricket') {
        const striker = teamASquad[0] || { id: 'p_1', name: 'Striker' };
        const nonStriker = teamASquad[1] || { id: 'p_2', name: 'Non-Striker' };
        const bowler = teamBSquad[0] || { id: 'p_b1', name: 'Opening Bowler' };

        initialMatch.cricketState = {
          format: cricketFormat,
          maxOvers: cricketFormat === 'T20' ? 20 : cricketFormat === 'ODI' ? 50 : customOvers || 20,
          currentInningsIndex: 0,
          innings: [
            {
              inningsNumber: 1,
              battingTeamId: teamAData.id,
              bowlingTeamId: teamBData.id,
              runs: 0,
              wickets: 0,
              legalBalls: 0,
              oversFormatted: '0.0',
              currentRunRate: 0,
              extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 },
              batters: [
                { playerId: striker.id, name: striker.name, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false },
                { playerId: nonStriker.id, name: nonStriker.name, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false },
              ],
              bowlers: [
                { playerId: bowler.id, name: bowler.name, overs: '0.0', legalBalls: 0, maidens: 0, runsConceded: 0, wickets: 0, economy: 0 },
              ],
              currentStrikerId: striker.id,
              currentNonStrikerId: nonStriker.id,
              currentBowlerId: bowler.id,
              currentPartnership: { runs: 0, balls: 0 },
              fallOfWickets: [],
              oversHistory: [],
              isCompleted: false,
            },
          ],
        };
      }

      // Initialize Kabaddi State if Kabaddi
      if (sport === 'kabaddi') {
        initialMatch.kabaddiState = {
          half: '1st',
          minute: 0,
          raidClock: 30,
          isTimerRunning: true,
          homeScore: 0,
          awayScore: 0,
          homeTouchPoints: 0,
          awayTouchPoints: 0,
          homeBonusPoints: 0,
          awayBonusPoints: 0,
          homeTacklePoints: 0,
          awayTacklePoints: 0,
          homeAllOutPoints: 0,
          awayAllOutPoints: 0,
          homeActivePlayers: Math.min(teamASquad.length || 7, 7),
          awayActivePlayers: Math.min(teamBSquad.length || 7, 7),
          raidingTeam: 'home',
          isDoOrDie: false,
          isSuperTackleOn: false,
          lastPlay: 'Match Kickoff',
        };
      }

      const created = await createMatch(initialMatch);
      onMatchCreated(created.id, sport);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize match');
    } finally {
      setSubmitting(false);
    }
  };

  const activeSquad = activeSquadTab === 'teamA' ? teamASquad : teamBSquad;
  const activeTeamName = activeSquadTab === 'teamA' ? teamAName : teamBName;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-24 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#0c1424] via-[#090f1f] to-[#0c1424] border-b border-slate-800/80 px-4 sm:px-6 py-4 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 text-slate-200 transition-colors cursor-pointer"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>MARKETINGLU BROADCAST ENGINE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-emerald-400">RAPID CUSTOM MATCH MAKER</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Space_Grotesk',sans-serif]">
                Create Match, Custom Teams &amp; Squad Rosters
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSwapTeams}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a1120] hover:bg-[#101b33] border border-cyan-500/30 text-cyan-300 text-xs font-bold cursor-pointer transition-all shadow-sm"
              title="Swap Home (Team A) and Away (Team B)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Swap Home / Away</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 w-full overflow-hidden">
        {/* Quick Notification Toast */}
        {saveSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-bounce">
            <BookmarkCheck className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Sport Selection */}
          <div className="bg-gradient-to-br from-[#0c1424]/90 to-[#070b14]/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5" />
                <span>1. Select Sport Discipline</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">11 Sports Available</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
              {(Object.keys(SPORT_CONFIGS) as SportType[]).map((s) => {
                const isSelected = sport === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSportChange(s)}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-gradient-to-b from-cyan-500/25 to-blue-600/25 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                        : 'bg-[#060a14] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">
                      {s === 'cricket' && '🏏'}
                      {s === 'football' && '⚽'}
                      {s === 'basketball' && '🏀'}
                      {s === 'kabaddi' && '🤼'}
                      {s === 'tennis' && '🎾'}
                      {s === 'badminton' && '🏸'}
                      {s === 'table_tennis' && '🏓'}
                      {s === 'volleyball' && '🏐'}
                      {s === 'field_hockey' && '🏑'}
                      {s === 'baseball' && '⚾'}
                      {s === 'rugby' && '🏉'}
                    </span>
                    <span className="capitalize text-[11px] truncate w-full text-center">
                      {s.replace('_', ' ')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Tournament & Broadcast Meta */}
          <div className="bg-gradient-to-br from-[#0c1424]/90 to-[#070b14]/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                2. Tournament &amp; Schedule Details
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoMatchName}
                  onChange={(e) => setAutoMatchName(e.target.checked)}
                  className="accent-cyan-400 rounded"
                />
                <span>Auto-sync Match Title from Teams</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Tournament / League
                </label>
                <input
                  type="text"
                  required
                  value={tournament}
                  onChange={(e) => setTournament(e.target.value)}
                  className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Match Stage / Title
                </label>
                <input
                  type="text"
                  required
                  value={matchName}
                  onChange={(e) => {
                    setAutoMatchName(false);
                    setMatchName(e.target.value);
                  }}
                  className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Stadium / Venue
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-2 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-2 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>

            {sport === 'cricket' && (
              <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-4 text-xs">
                <span className="font-semibold text-slate-400 font-mono">CRICKET FORMAT:</span>
                {(['T20', 'ODI', 'CUSTOM'] as CricketFormat[]).map((fmt) => (
                  <label key={fmt} className="flex items-center gap-1.5 text-white cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="cricketFormat"
                      checked={cricketFormat === fmt}
                      onChange={() => setCricketFormat(fmt)}
                      className="accent-cyan-400"
                    />
                    <span>{fmt}</span>
                  </label>
                ))}
                {cricketFormat === 'CUSTOM' && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-slate-400 text-[11px]">Overs:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={customOvers}
                      onChange={(e) => setCustomOvers(parseInt(e.target.value) || 20)}
                      className="w-16 bg-[#060a14] border border-slate-800 rounded-lg px-2 py-1 text-xs text-center text-cyan-300 font-mono"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Custom Teams Studio (Side-by-side with Zero Redundancy) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Team A (Home Side) */}
            <div className="bg-gradient-to-br from-[#0c1424]/90 to-[#070b14]/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4 relative">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 uppercase">
                    HOME SIDE • TEAM A
                  </span>
                  <div className="w-3.5 h-3.5 rounded-full border border-white/20 shadow" style={{ backgroundColor: teamAColor }} />
                </div>

                <div className="flex items-center gap-2">
                  {/* Load from Vault */}
                  <div className="relative group">
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#060a14] hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 cursor-pointer"
                      title="Load a saved team from your vault"
                    >
                      <FolderOpen className="w-3 h-3 text-cyan-400" />
                      <span>Load Team</span>
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-[#090f1f] border border-slate-800 rounded-xl shadow-2xl p-1 z-40 hidden group-hover:block max-h-52 overflow-y-auto">
                      <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase">Saved Vault Teams</div>
                      {vaultTeams.map((vt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleLoadVaultTeam('teamA', vt)}
                          className="w-full text-left px-2 py-1.5 rounded text-xs text-white hover:bg-cyan-500/20 hover:text-cyan-200 truncate flex items-center justify-between"
                        >
                          <span>{vt.name}</span>
                          <span className="text-[10px] font-mono text-cyan-400">{vt.shortName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save Team to Vault */}
                  <button
                    type="button"
                    onClick={() => handleSaveTeamToVault('teamA')}
                    className="p-1 rounded-lg bg-[#060a14] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Save this custom team to Vault"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Team Name & Short Code */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Custom Team Name
                  </label>
                  <input
                    type="text"
                    required
                    value={teamAName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTeamAName(val);
                      if (!teamAShort || teamAShort === deriveShortCode(teamAName)) {
                        setTeamAShort(deriveShortCode(val));
                      }
                    }}
                    placeholder="e.g. Thunderbolts Club"
                    className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Short Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={teamAShort}
                    onChange={(e) => setTeamAShort(e.target.value.toUpperCase())}
                    placeholder="TBC"
                    className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white font-mono uppercase outline-none text-center"
                  />
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Team Colors (Primary &amp; Accent)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[#060a14] border border-slate-800 rounded-xl px-2 py-1">
                    <input
                      type="color"
                      value={teamAColor}
                      onChange={(e) => setTeamAColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      title="Primary Color"
                    />
                    <span className="text-[11px] font-mono text-cyan-300">{teamAColor}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#060a14] border border-slate-800 rounded-xl px-2 py-1">
                    <input
                      type="color"
                      value={teamASecondary}
                      onChange={(e) => setTeamASecondary(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      title="Secondary / Accent Color"
                    />
                    <span className="text-[11px] font-mono text-slate-400">{teamASecondary}</span>
                  </div>

                  {/* Quick Color Swatches */}
                  <div className="flex items-center gap-1">
                    {COLOR_SWATCHES.slice(0, 5).map((sw, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setTeamAColor(sw.color)}
                        className="w-4 h-4 rounded-full border border-slate-700 hover:scale-125 transition-transform cursor-pointer"
                        style={{ backgroundColor: sw.color }}
                        title={sw.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Logo Manager */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    Team Logo &amp; Broadcast Emblem
                  </label>
                  <button
                    type="button"
                    onClick={() => handleGenerateSvgLogo('teamA')}
                    className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer font-bold"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto SVG Crest</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {teamALogoUrl ? (
                      <img src={teamALogoUrl} alt="Team A Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-5 h-5 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={teamALogoUrl}
                      onChange={(e) => setTeamALogoUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-2.5 py-1 text-[11px] text-white font-mono outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputARef}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'teamA')}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputARef.current?.click()}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#060a14] hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 cursor-pointer"
                      >
                        <Upload className="w-3 h-3 text-cyan-400" />
                        <span>Upload File</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLogoPickerTarget('teamA')}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#060a14] hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3 text-cyan-400" />
                        <span>Presets Gallery</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team B (Away Side) */}
            <div className="bg-gradient-to-br from-[#0c1424]/90 to-[#070b14]/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4 relative">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 uppercase">
                    AWAY SIDE • TEAM B
                  </span>
                  <div className="w-3.5 h-3.5 rounded-full border border-white/20 shadow" style={{ backgroundColor: teamBColor }} />
                </div>

                <div className="flex items-center gap-2">
                  {/* Load from Vault */}
                  <div className="relative group">
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#060a14] hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 cursor-pointer"
                      title="Load a saved team from your vault"
                    >
                      <FolderOpen className="w-3 h-3 text-amber-400" />
                      <span>Load Team</span>
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-[#090f1f] border border-slate-800 rounded-xl shadow-2xl p-1 z-40 hidden group-hover:block max-h-52 overflow-y-auto">
                      <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase">Saved Vault Teams</div>
                      {vaultTeams.map((vt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleLoadVaultTeam('teamB', vt)}
                          className="w-full text-left px-2 py-1.5 rounded text-xs text-white hover:bg-amber-500/20 hover:text-amber-200 truncate flex items-center justify-between"
                        >
                          <span>{vt.name}</span>
                          <span className="text-[10px] font-mono text-amber-400">{vt.shortName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save Team to Vault */}
                  <button
                    type="button"
                    onClick={() => handleSaveTeamToVault('teamB')}
                    className="p-1 rounded-lg bg-[#060a14] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Save this custom team to Vault"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Team Name & Short Code */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Custom Team Name
                  </label>
                  <input
                    type="text"
                    required
                    value={teamBName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTeamBName(val);
                      if (!teamBShort || teamBShort === deriveShortCode(teamBName)) {
                        setTeamBShort(deriveShortCode(val));
                      }
                    }}
                    placeholder="e.g. Phoenix Rising"
                    className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Short Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={teamBShort}
                    onChange={(e) => setTeamBShort(e.target.value.toUpperCase())}
                    placeholder="PHX"
                    className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white font-mono uppercase outline-none text-center"
                  />
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Team Colors (Primary &amp; Accent)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[#060a14] border border-slate-800 rounded-xl px-2 py-1">
                    <input
                      type="color"
                      value={teamBColor}
                      onChange={(e) => setTeamBColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      title="Primary Color"
                    />
                    <span className="text-[11px] font-mono text-amber-300">{teamBColor}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#060a14] border border-slate-800 rounded-xl px-2 py-1">
                    <input
                      type="color"
                      value={teamBSecondary}
                      onChange={(e) => setTeamBSecondary(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      title="Secondary / Accent Color"
                    />
                    <span className="text-[11px] font-mono text-slate-400">{teamBSecondary}</span>
                  </div>

                  {/* Quick Color Swatches */}
                  <div className="flex items-center gap-1">
                    {COLOR_SWATCHES.slice(4, 9).map((sw, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setTeamBColor(sw.color)}
                        className="w-4 h-4 rounded-full border border-slate-700 hover:scale-125 transition-transform cursor-pointer"
                        style={{ backgroundColor: sw.color }}
                        title={sw.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Logo Manager */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    Team Logo &amp; Broadcast Emblem
                  </label>
                  <button
                    type="button"
                    onClick={() => handleGenerateSvgLogo('teamB')}
                    className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer font-bold"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto SVG Crest</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl bg-[#060a14] border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {teamBLogoUrl ? (
                      <img src={teamBLogoUrl} alt="Team B Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-5 h-5 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={teamBLogoUrl}
                      onChange={(e) => setTeamBLogoUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl px-2.5 py-1 text-[11px] text-white font-mono outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputBRef}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'teamB')}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputBRef.current?.click()}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#060a14] hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 cursor-pointer"
                      >
                        <Upload className="w-3 h-3 text-amber-400" />
                        <span>Upload File</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLogoPickerTarget('teamB')}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#060a14] hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3 text-amber-400" />
                        <span>Presets Gallery</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Broadcast Overlay Preview Strip */}
          <div className="bg-[#090f1f]/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>LIVE OBS OVERLAY SCOREBUG PREVIEW:</span>
            </div>

            {/* Simulated Live Scorebug */}
            <div className="bg-black/80 border border-cyan-500/40 rounded-xl px-4 py-2 flex items-center gap-4 shadow-xl">
              <div className="flex items-center gap-2">
                {teamALogoUrl && <img src={teamALogoUrl} alt="" className="w-6 h-6 rounded-md object-cover" />}
                <span className="font-bold text-xs font-mono text-white" style={{ color: teamAColor }}>
                  {teamAShort || 'HOME'}
                </span>
                <span className="font-black text-xs font-mono text-white">0</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold">VS</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs font-mono text-white">0</span>
                <span className="font-bold text-xs font-mono text-white" style={{ color: teamBColor }}>
                  {teamBShort || 'AWAY'}
                </span>
                {teamBLogoUrl && <img src={teamBLogoUrl} alt="" className="w-6 h-6 rounded-md object-cover" />}
              </div>
            </div>
          </div>

          {/* Section 4: Squad Roster & Player Lineup Manager */}
          <div className="bg-gradient-to-br from-[#0c1424]/90 to-[#070b14]/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <label className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>4. Squad Rosters &amp; Player Lineups</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Configure players with jersey numbers and tactical roles to display in live overlays and consoles.
                </p>
              </div>

              {/* Squad Tabs & Quick Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 p-1 bg-[#060a14] rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveSquadTab('teamA')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeSquadTab === 'teamA'
                        ? 'bg-cyan-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {teamAName || 'Team A'} ({teamASquad.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSquadTab('teamB')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeSquadTab === 'teamB'
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {teamBName || 'Team B'} ({teamBSquad.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBulkModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#060a14] hover:bg-slate-800 border border-cyan-500/40 text-xs font-bold text-cyan-300 cursor-pointer shadow-sm"
                  title="Paste whole squad list at once"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Bulk Import</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerateStandardRoster(activeSquadTab)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#060a14] hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
                  title="Generate standard squad size for this sport"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Auto-Roster</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleClearSquad(activeSquadTab)}
                  className="p-1.5 rounded-xl bg-[#060a14] hover:bg-rose-500/20 border border-slate-800 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Clear squad"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Add Player Input Bar */}
            <div className="p-3 rounded-xl bg-[#060a14] border border-slate-800 flex flex-wrap items-center gap-2.5">
              <input
                type="number"
                min="1"
                max="99"
                value={newPlayerNumber}
                onChange={(e) => setNewPlayerNumber(parseInt(e.target.value) || 1)}
                placeholder="#"
                className="w-14 bg-[#0a1120] border border-slate-800 focus:border-cyan-400 rounded-lg px-2 py-1.5 text-xs text-center font-mono text-cyan-300 outline-none"
                title="Jersey Number"
              />
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPlayer();
                  }
                }}
                placeholder={`Type player name for ${activeTeamName}... (Hit Enter)`}
                className="flex-1 min-w-[180px] bg-[#0a1120] border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
              />
              <select
                value={newPlayerRole}
                onChange={(e) => setNewPlayerRole(e.target.value as PlayerRole)}
                className="bg-[#0a1120] border border-slate-800 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none capitalize"
              >
                <option value="batter">Batter</option>
                <option value="bowler">Bowler</option>
                <option value="all-rounder">All-Rounder</option>
                <option value="wicketkeeper">Wicketkeeper</option>
                <option value="raider">Raider (Kabaddi)</option>
                <option value="defender">Defender</option>
                <option value="forward">Forward</option>
                <option value="midfielder">Midfielder</option>
                <option value="goalkeeper">Goalkeeper</option>
                <option value="guard">Guard</option>
                <option value="center">Center</option>
                <option value="player">General Player</option>
              </select>

              <label className="flex items-center gap-1 text-[11px] font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPlayerIsCaptain}
                  onChange={(e) => {
                    setNewPlayerIsCaptain(e.target.checked);
                    if (e.target.checked) setNewPlayerIsViceCaptain(false);
                  }}
                  className="accent-cyan-400"
                />
                <span>(C)</span>
              </label>

              <button
                type="button"
                onClick={handleAddPlayer}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs cursor-pointer shadow-md hover:from-cyan-300 hover:to-blue-400"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Player</span>
              </button>
            </div>

            {/* Players Table */}
            <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-[#060a14]/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0a1120] border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono sticky top-0 z-10">
                  <tr>
                    <th className="py-2 px-3 w-14">#</th>
                    <th className="py-2 px-3">Player Name</th>
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3 text-center w-24">Captaincy</th>
                    <th className="py-2 px-3 text-right w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {activeSquad.map((player) => (
                    <tr key={player.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-3 font-bold text-cyan-400">
                        {player.number ? `#${player.number}` : '-'}
                      </td>
                      <td className="py-2 px-3 font-sans font-semibold text-white flex items-center gap-2">
                        <span>{player.name}</span>
                        {player.isCaptain && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono text-amber-300 font-bold">
                            C
                          </span>
                        )}
                        {player.isViceCaptain && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 font-bold">
                            VC
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] capitalize text-slate-300">
                          {player.role}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleToggleBadge(activeSquadTab, player.id, 'captain')}
                            className={`px-1.5 py-0.5 rounded cursor-pointer ${
                              player.isCaptain
                                ? 'bg-amber-400 text-slate-950 font-bold'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            C
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleBadge(activeSquadTab, player.id, 'vice')}
                            className={`px-1.5 py-0.5 rounded cursor-pointer ${
                              player.isViceCaptain
                                ? 'bg-cyan-400 text-slate-950 font-bold'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            VC
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemovePlayer(activeSquadTab, player.id)}
                          className="p-1 hover:text-rose-400 text-slate-500 transition-colors cursor-pointer"
                          title="Remove player"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeSquad.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-xs font-sans">
                        No players added to {activeTeamName} yet. Use the quick add bar above or click &ldquo;Bulk Import&rdquo;.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{submitting ? 'Creating Match...' : 'Deploy Match to Scoring & OBS'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Preset Logos Modal Drawer */}
      {logoPickerTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLogoPickerTarget(null)}
        >
          <div
            className="bg-gradient-to-b from-[#0c1424] to-[#070b14] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Select Logo Preset for {logoPickerTarget === 'teamA' ? teamAName : teamBName}</span>
              </h3>
              <button
                onClick={() => setLogoPickerTarget(null)}
                className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESET_LOGOS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    if (logoPickerTarget === 'teamA') setTeamALogoUrl(p.url);
                    else setTeamBLogoUrl(p.url);
                    setLogoPickerTarget(null);
                  }}
                  className="p-2.5 rounded-xl bg-[#060a14] hover:bg-[#0d162b] border border-slate-800 hover:border-cyan-400 transition-all cursor-pointer flex flex-col items-center gap-2 group"
                >
                  <img src={p.url} alt={p.label} className="w-12 h-12 rounded-lg object-cover group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-bold text-slate-300 group-hover:text-cyan-300 text-center">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Player Import Modal */}
      {showBulkModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowBulkModal(false)}
        >
          <div
            className="bg-gradient-to-b from-[#0c1424] to-[#070b14] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Bulk Import Squad for {activeTeamName}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Paste player names separated by newlines, commas, or semicolons.
                </p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <textarea
              rows={6}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="e.g.&#10;Rohit Sharma&#10;Virat Kohli&#10;Suryakumar Yadav&#10;Hardik Pandya&#10;Jasprit Bumrah"
              className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl p-3 text-xs text-white outline-none font-mono placeholder:text-slate-600"
            />

            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] font-mono text-slate-500">
                {bulkText.split(/[\n,;]+/).filter((s) => s.trim()).length} players detected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportBulkPlayers}
                  disabled={!bulkText.trim()}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs disabled:opacity-50 cursor-pointer shadow"
                >
                  Import Players
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
