import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Search, Shield, Zap, Award, CheckCircle, Flag, Clock, Layers, Sparkles } from 'lucide-react';
import { SportType } from '../types/sports';

interface RuleBooksProps {
  onBack: () => void;
  onNavigateToConsole?: (sport: SportType) => void;
}

export interface SportRuleData {
  id: SportType;
  name: string;
  governingBody: string;
  icon: string;
  badgeColor: string;
  summary: string;
  duration: string;
  teamSize: string;
  scoringBreakdown: { label: string; points: string; detail: string }[];
  keyRules: { title: string; description: string }[];
  refereeSignals: { signal: string; meaning: string }[];
  broadcastTips: string[];
}

export const SPORTS_RULES: SportRuleData[] = [
  {
    id: 'cricket',
    name: 'Cricket',
    governingBody: 'ICC (International Cricket Council)',
    icon: '🏏',
    badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    summary: 'A bat-and-ball contest played between two teams of 11 players. The batting side scores runs while the bowling side aims to dismiss batters and restrict scoring.',
    duration: 'T20: 20 overs per side (~3.5 hrs) • ODI: 50 overs (~8 hrs) • Test: 5 Days',
    teamSize: '11 players per side (1 wicketkeeper + batters, bowlers, all-rounders)',
    scoringBreakdown: [
      { label: 'Single / Odd Runs', points: '1, 3, 5 runs', detail: 'Runs completed between wickets; batters rotate strike.' },
      { label: 'Boundary Four', points: '4 runs', detail: 'Ball reaches or crosses the perimeter rope after touching ground.' },
      { label: 'Maximum Six', points: '6 runs', detail: 'Ball crosses the perimeter boundary on the full without touching the ground.' },
      { label: 'Wide / No Ball', points: '1 extra run', detail: 'Illegal delivery; ball does not count toward 6-ball over; No Ball earns Free Hit.' },
      { label: 'Byes / Leg Byes', points: 'Runs completed', detail: 'Extras conceded without bat contact; counts toward team total, not batter.' },
    ],
    keyRules: [
      { title: 'Strike Rotation', description: 'When odd runs are scored or after 6 legal deliveries (over end), the batters switch ends.' },
      { title: 'Free Hit', description: 'Any front-foot or illegal field No Ball awards the batting side an immune Free Hit next ball (can only be run out).' },
      { title: 'Powerplay Restrictions', description: 'T20 overs 1–6: Only 2 fielders allowed outside 30-yard circle. Overs 7–20: Maximum 5 fielders outside circle.' },
      { title: 'DLS Method', description: 'Rain-interrupted matches recalculate targets based on remaining resources (wickets in hand and overs remaining).' },
    ],
    refereeSignals: [
      { signal: 'Out', meaning: 'Index finger raised above head by umpire.' },
      { signal: 'Four Boundary', meaning: 'Arm waved back and forth horizontally across chest.' },
      { signal: 'Six Boundary', meaning: 'Both arms raised straight above head.' },
      { signal: 'Wide Delivery', meaning: 'Both arms extended horizontally sideways.' },
      { signal: 'No Ball', meaning: 'One arm extended horizontally out at shoulder height.' },
    ],
    broadcastTips: [
      'Trigger "FOUR" or "SIX" overlay alert immediately when ball hits rope.',
      'Show Required Run Rate (RRR) graphic continuously in 2nd innings chase.',
      'Highlight Milestones at 50 runs (half-century) and 100 runs (century).',
    ],
  },
  {
    id: 'football',
    name: 'Football (Soccer)',
    governingBody: 'IFAB / FIFA (International Football Association Board)',
    icon: '⚽',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    summary: 'Two teams of 11 players compete to score by driving a round ball into the opposing net using any part of the body except arms and hands.',
    duration: '90 Minutes (Two 45-minute halves) + Stoppage / Extra Time (Two 15-min halves)',
    teamSize: '11 players per team (1 Goalkeeper + 10 Outfielders; max 5 substitutions)',
    scoringBreakdown: [
      { label: 'Goal', points: '1 point', detail: 'Entire ball crosses the goal line between goalposts and under crossbar.' },
      { label: 'Penalty Kick', points: 'Direct 12-yard kick', detail: 'Awarded for any foul committed inside penalty box by defending team.' },
      { label: 'Penalty Shootout', points: 'Best of 5 kicks', detail: 'Tiebreak decider following extra time in knockout tournament matches.' },
    ],
    keyRules: [
      { title: 'Offside Law (Law 11)', description: 'An attacker is offside if closer to opponent goal line than both ball and second-last opponent at the instant the ball is played to them.' },
      { title: 'Yellow & Red Cards', description: 'Two yellow cards in one match equal a red card; player is ejected with no replacement, team plays down a man.' },
      { title: 'VAR Protocol', description: 'Video Assistant Referee reviews 4 categories: Goals, Penalty decisions, Direct Red Cards, and Mistaken Identity.' },
      { title: 'Back-Pass Rule', description: 'Goalkeeper cannot handle the ball with hands if deliberately kicked to them by a teammate.' },
    ],
    refereeSignals: [
      { signal: 'Direct Free Kick', meaning: 'One arm points forward diagonally toward defending goal.' },
      { signal: 'Penalty Kick', meaning: 'Arm points directly to the 12-yard penalty spot.' },
      { signal: 'Yellow Card', meaning: 'Card held high in right hand facing offending player.' },
      { signal: 'VAR Review', meaning: 'Outlines a rectangular TV screen in the air with both index fingers.' },
    ],
    broadcastTips: [
      'Trigger "GOAL!" broadcast alert immediately with scorer name and minute tag.',
      'Show Red Card indicator beside team badge on scorebug for accurate broadcast man-advantage tracking.',
      'Display extra time (+3, +5 min) bug at the 45:00 and 90:00 marks.',
    ],
  },
  {
    id: 'basketball',
    name: 'Basketball',
    governingBody: 'FIBA / NBA (International Basketball Federation)',
    icon: '🏀',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    summary: 'Two teams of 5 players attempt to score by shooting a basketball through an elevated 10-foot hoop while adhering to dribbling and shot clock rules.',
    duration: 'FIBA: 4 Quarters of 10 min (40 min) • NBA: 4 Quarters of 12 min (48 min)',
    teamSize: '5 players on court (Point Guard, Shooting Guard, Small Forward, Power Forward, Center)',
    scoringBreakdown: [
      { label: 'Free Throw', points: '1 point', detail: 'Uncontested shot from 15-foot foul line following a shooting foul.' },
      { label: 'Field Goal', points: '2 points', detail: 'Any successful shot released from inside the 3-point perimeter arc.' },
      { label: 'Three-Pointer', points: '3 points', detail: 'Successful shot released with both feet entirely behind the 3-point line.' },
    ],
    keyRules: [
      { title: '24-Second Shot Clock', description: 'Offense must attempt a field goal that hits the rim within 24 seconds or turnover is called. Resets to 14s on offensive rebound.' },
      { title: '8-Second Backcourt', description: 'Offense must advance the ball across midcourt line within 8 seconds of gaining possession.' },
      { title: 'Team Foul Bonus', description: 'Once a team commits 5 fouls in a quarter, opponent shoots 2 bonus free throws on all subsequent non-shooting fouls.' },
      { title: 'Personal Foul Disqualification', description: 'A player is fouled out upon committing their 5th (FIBA) or 6th (NBA) personal foul.' },
    ],
    refereeSignals: [
      { signal: 'Three-Point Attempt', meaning: 'One arm raised with 3 fingers extended; both arms raised if made.' },
      { signal: 'Stop Clock', meaning: 'Open palm raised straight above head with whistle.' },
      { signal: 'Shot Clock Reset', meaning: 'One hand rotated in a circular motion with extended index finger.' },
    ],
    broadcastTips: [
      'Trigger "THREE POINTER!" overlay alert on downtown splashes.',
      'Turn shot clock digit text red when timer falls under 5 seconds.',
      'Display "BONUS" indicator on scorebug when foul threshold is crossed.',
    ],
  },
  {
    id: 'kabaddi',
    name: 'Kabaddi',
    governingBody: 'IKF / Pro Kabaddi League',
    icon: '🤼',
    badgeColor: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
    summary: 'High-intensity contact sport where a raider enters opponent court chanting "Kabaddi", aims to touch defenders, and returns safely within 30 seconds.',
    duration: '40 Minutes (Two 20-minute halves) with a 5-minute halftime break',
    teamSize: '7 players on mat per team (5 substitutes; 12 total squad)',
    scoringBreakdown: [
      { label: 'Touch Point', points: '1 point', detail: 'Raider tags a defender and crosses back over the midline safely.' },
      { label: 'Bonus Point', points: '1 point', detail: 'Raider crosses bonus line with trailing foot in the air (requires 6+ defenders on mat).' },
      { label: 'Tackle Point', points: '1 point', detail: 'Defending unit pins and captures the raider before they can cross midline.' },
      { label: 'Super Tackle', points: '2 points', detail: 'Defense successfully tackles raider when defending with 3 or fewer players.' },
      { label: 'All-Out (Lona)', points: '2 bonus points', detail: 'Awarded when all 7 opponent players are eliminated; reviving full 7-man unit.' },
    ],
    keyRules: [
      { title: '30-Second Raid Clock', description: 'Each raid must conclude within 30 seconds or the raider is declared out.' },
      { title: 'Do-or-Die Raid', description: 'If a team conducts 2 consecutive empty raids, the 3rd raid is Do-or-Die: raider must score or is out.' },
      { title: 'Revival System', description: 'Every point scored revives one out player back onto the mat in sequence of dismissal.' },
      { title: 'Lobby Access', description: 'Yellow side lobbies only become active after touch contact has been initiated.' },
    ],
    refereeSignals: [
      { signal: 'Touch Point', meaning: 'Index finger pointing toward scoring team with whistle.' },
      { signal: 'Bonus Point', meaning: 'Thumb pointed up toward the ceiling.' },
      { signal: 'Super Tackle', meaning: 'Two fingers held up indicating 2 points.' },
      { signal: 'All Out', meaning: 'Both arms crossed across chest, then opened outward.' },
    ],
    broadcastTips: [
      'Trigger "SUPER RAID!" alert for 3+ points in a single raid.',
      'Trigger "SUPER TACKLE!" alert when 3 or fewer defenders capture raider.',
      'Display real-time "Players on Mat" count on scorebug (e.g. 7 vs 4).',
    ],
  },
  {
    id: 'tennis',
    name: 'Lawn Tennis',
    governingBody: 'ITF / ATP / WTA / Grand Slam Board',
    icon: '🎾',
    badgeColor: 'border-lime-500/40 text-lime-400 bg-lime-500/10',
    summary: 'Racket sport played individually (singles) or in pairs (doubles) across a net. Players hit a felt ball within court boundaries to win points, games, and sets.',
    duration: 'Best of 3 Sets (WTA/ATP Tour) • Best of 5 Sets (Men Grand Slams)',
    teamSize: '1 player (Singles) or 2 players (Doubles)',
    scoringBreakdown: [
      { label: 'Point Progression', points: '15, 30, 40, Game', detail: '0 = "Love", 1st point = 15, 2nd point = 30, 3rd point = 40, 4th = Game.' },
      { label: 'Deuce & Advantage', points: '2-point margin', detail: 'Tied at 40-40 is Deuce; next point is "Advantage" (Ad); must win by 2 points.' },
      { label: 'Tie-break', points: 'First to 7 (by 2)', detail: 'Triggered at 6-6 in games. Deciding Grand Slam 5th set uses 10-point tiebreak.' },
    ],
    keyRules: [
      { title: 'Service Alternation', description: 'Server gets two serves per point. Serve alternates after each game; in tiebreaks, server serves 1 point then players alternate every 2 points.' },
      { title: 'Fault & Double Fault', description: 'Serve landing outside service box or into net is a fault; two consecutive faults award point to receiver.' },
      { title: 'Let Rule', description: 'If a serve clips net cord and lands in valid service box, it is replayed with no penalty.' },
    ],
    refereeSignals: [
      { signal: 'Fault', meaning: 'Arm pointed directly toward faulty service court.' },
      { signal: 'Out', meaning: 'Arm pointed outward horizontally with index finger.' },
      { signal: 'Correction', meaning: 'Hand held flat above head signalling overruled line call.' },
    ],
    broadcastTips: [
      'Trigger "SERVICE ACE!" alert on unreturnable clean service aces.',
      'Display Break Point and Set Point status badges on scorebug.',
    ],
  },
  {
    id: 'badminton',
    name: 'Badminton',
    governingBody: 'BWF (Badminton World Federation)',
    icon: '🏸',
    badgeColor: 'border-red-500/40 text-red-400 bg-red-500/10',
    summary: 'Fastest racquet sport in the world, hitting a feathered shuttlecock over a 1.55m net using lightweight racquets.',
    duration: 'Best of 3 Games to 21 points (Rally Point System)',
    teamSize: '1 player (Singles) or 2 players (Doubles)',
    scoringBreakdown: [
      { label: 'Rally Point', points: '1 point', detail: 'Every rally won scores 1 point regardless of who served.' },
      { label: 'Game Cap', points: '21 pts (max 30)', detail: 'Must win by 2 points at 20-20; if reaching 29-29, first to 30 wins.' },
    ],
    keyRules: [
      { title: 'Service Diagonal Rule', description: 'Server serves from right court on even scores (0, 2, 4...) and left court on odd scores (1, 3, 5...).' },
      { title: 'Below Waist Serve', description: 'Shuttlecock must be struck below 1.15m height from the surface at instant of racket contact.' },
    ],
    refereeSignals: [
      { signal: 'Service Fault', meaning: 'Hand placed across abdomen indicating waist violation.' },
      { signal: 'In / Good', meaning: 'Arm pointed down toward court line.' },
    ],
    broadcastTips: ['Display "GAME POINT" and "MATCH POINT" alert graphics when 1 point away.'],
  },
  {
    id: 'field_hockey',
    name: 'Field Hockey',
    governingBody: 'FIH (International Hockey Federation)',
    icon: '🏑',
    badgeColor: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
    summary: 'Two teams of 11 players use curved J-shaped composite sticks to drive a hard plastic ball into the opposing net.',
    duration: '60 Minutes (Four 15-minute quarters)',
    teamSize: '11 players per team (1 Goalkeeper + 10 Outfielders)',
    scoringBreakdown: [
      { label: 'Field Goal', points: '1 point', detail: 'Struck from inside the 16-yard shooting circle.' },
      { label: 'Penalty Corner', points: 'Set-piece', detail: 'Awarded for defensive infractions within circle; ball injected from backline.' },
      { label: 'Penalty Stroke', points: '1-on-1 stroke', detail: 'Awarded for intentional foul denying probable goal.' },
    ],
    keyRules: [
      { title: 'Shooting Circle (D)', description: 'A goal can ONLY be scored if the ball was struck or touched by an attacker inside shooting circle.' },
      { title: 'Green, Yellow, Red Cards', description: 'Green = 2-min suspension; Yellow = 5 or 10-min suspension; Red = Permanent ejection.' },
    ],
    refereeSignals: [
      { signal: 'Penalty Corner', meaning: 'Both arms extended horizontally pointing toward goal.' },
      { signal: 'Goal Awarded', meaning: 'Both arms pointed toward center circle.' },
    ],
    broadcastTips: ['Show card suspension penalty clocks (e.g. Yellow Card 5:00 countdown).'],
  },
  {
    id: 'table_tennis',
    name: 'Table Tennis (Ping Pong)',
    governingBody: 'ITTF (International Table Tennis Federation)',
    icon: '🏓',
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    summary: 'Fast-paced table sport played on a 2.74m hard table with lightweight celluloid ball and rubber-faced paddles.',
    duration: 'Best of 5 or Best of 7 Games to 11 points',
    teamSize: '1 player (Singles) or 2 players (Doubles)',
    scoringBreakdown: [
      { label: 'Point', points: '1 point', detail: 'Opponent fails to return ball over net or lands outside boundary.' },
      { label: 'Game Cap', points: '11 pts (by 2)', detail: 'At 10-10, players alternate single serves until a 2-point lead is established.' },
    ],
    keyRules: [
      { title: '2-Serve Alternation', description: 'Each player serves 2 consecutive points regardless of score outcome.' },
      { title: 'Toss Height', description: 'Ball must be thrown nearly vertically at least 16cm into the air from open palm.' },
    ],
    refereeSignals: [
      { signal: 'Let', meaning: 'Index finger held up indicating net clip replay.' },
      { signal: 'Edge Ball', meaning: 'Hand held flat palm down over table edge.' },
    ],
    broadcastTips: ['Display "GAME POINT" badge when a player reaches 10 points.'],
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    governingBody: 'FIVB (International Volleyball Federation)',
    icon: '🏐',
    badgeColor: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',
    summary: 'Two teams of 6 separated by a high net hit an inflated ball with hands/arms, seeking to ground it on opponent court.',
    duration: 'Best of 5 Sets (Sets 1-4 to 25 pts, deciding Set 5 to 15 pts)',
    teamSize: '6 players on court + 1 Libero defensive specialist',
    scoringBreakdown: [
      { label: 'Rally Point', points: '1 point', detail: 'Awarded on every ball grounded or opponent error.' },
      { label: 'Deciding 5th Set', points: '15 points (by 2)', detail: 'First team to 15 with 2-point lead wins tiebreaker set.' },
    ],
    keyRules: [
      { title: '3-Touch Maximum', description: 'Team is allowed a maximum of 3 touches to return ball (blocks do not count as touches).' },
      { title: 'Rotation Order', description: 'Teams rotate clockwise whenever winning the serve from opponent.' },
      { title: 'Libero Rules', description: 'Libero wears distinct color jersey; cannot attack, serve, or block above net height.' },
    ],
    refereeSignals: [
      { signal: 'Point Awarded', meaning: 'Arm pointed toward side of team that won rally.' },
      { signal: 'Ball In', meaning: 'Arm pointed diagonally down toward court.' },
      { signal: 'Four Hits', meaning: 'Four fingers raised above head.' },
    ],
    broadcastTips: ['Display Set Count (e.g. 2 - 1) and active server indicator on overlay.'],
  },
  {
    id: 'baseball',
    name: 'Baseball',
    governingBody: 'WBSC / MLB (World Baseball Softball Confederation)',
    icon: '⚾',
    badgeColor: 'border-sky-500/40 text-sky-400 bg-sky-500/10',
    summary: 'Bat-and-ball game played between two 9-player teams taking turns batting and fielding across 9 innings.',
    duration: '9 Innings (~2.5 to 3 hours) + Extra Innings if tied',
    teamSize: '9 players in lineup (Pitcher, Catcher, 4 Infielders, 3 Outfielders)',
    scoringBreakdown: [
      { label: 'Run', points: '1 point', detail: 'Scored when runner safely touches 1st, 2nd, 3rd and Home plate in sequence.' },
      { label: 'Home Run', points: '1 to 4 runs', detail: 'Ball hit out of ballpark fair; drives in batter plus all runners on base.' },
      { label: 'Grand Slam', points: '4 runs', detail: 'Home run hit with bases loaded (runner on 1st, 2nd, and 3rd).' },
    ],
    keyRules: [
      { title: '3 Strikes / 4 Balls', description: '3 strikes result in an Out (Strikeout). 4 balls result in a Walk (Base on Balls).' },
      { title: '3 Outs Per Half-Inning', description: 'Fielding side must record 3 outs to conclude half-inning and switch to bat.' },
      { title: 'Infield Fly Rule', description: 'Prevents intentional drops on pop flies with runners on 1st and 2nd and under 2 outs.' },
    ],
    refereeSignals: [
      { signal: 'Strike', meaning: 'Right fist pumped forward with verbal call.' },
      { signal: 'Safe', meaning: 'Both arms extended horizontally out, palms down.' },
      { signal: 'Out', meaning: 'Fist pumped upward at shoulder height.' },
    ],
    broadcastTips: [
      'Render diamond bases status graphic (1B, 2B, 3B filled yellow).',
      'Show Count (Balls-Strikes-Outs, e.g. 3-2-2) on bug at all times.',
    ],
  },
  {
    id: 'rugby',
    name: 'Rugby Union',
    governingBody: 'World Rugby',
    icon: '🏉',
    badgeColor: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10',
    summary: 'Physical collision sport where players carry an oval ball in hands and kick it, passing only backward.',
    duration: '80 Minutes (Two 40-minute halves) with running clock',
    teamSize: '15 players per team (8 Forwards + 7 Backs)',
    scoringBreakdown: [
      { label: 'Try', points: '5 points', detail: 'Grounding ball over opponent goal line in in-goal area.' },
      { label: 'Conversion', points: '2 points', detail: 'Place kick through goalposts following a try.' },
      { label: 'Penalty Goal', points: '3 points', detail: 'Direct kick through goalposts awarded for major foul.' },
      { label: 'Drop Goal', points: '3 points', detail: 'Kicking ball through goalposts on the half-volley during open play.' },
    ],
    keyRules: [
      { title: 'Backward Passing', description: 'Ball cannot be passed or knocked forward with hands/arms; forward pass results in Scrum.' },
      { title: 'Sin Bin (Yellow Card)', description: 'Player is suspended for 10 minutes; team plays with 14 men.' },
      { title: 'Tackle & Release', description: 'Tackled player must immediately release ball; tackler must roll away.' },
    ],
    refereeSignals: [
      { signal: 'Try Awarded', meaning: 'Arm pointed directly toward in-goal area with whistle.' },
      { signal: 'Penalty Kick', meaning: 'Arm raised upward at 45-degree angle toward non-offending side.' },
    ],
    broadcastTips: ['Show Sin Bin 10-minute yellow card countdown clock on screen.'],
  },
];

export const RuleBooks: React.FC<RuleBooksProps> = ({ onBack, onNavigateToConsole }) => {
  const [selectedSport, setSelectedSport] = useState<SportType>('cricket');
  const [searchQuery, setSearchQuery] = useState('');

  const currentRule = SPORTS_RULES.find((r) => r.id === selectedSport) || SPORTS_RULES[0];

  const filteredRules = SPORTS_RULES.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.keyRules.some((k) => k.title.toLowerCase().includes(searchQuery.toLowerCase()) || k.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-20 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#0c1424] via-[#090f1f] to-[#0c1424] border-b border-slate-800/80 px-4 sm:px-6 py-5 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 hover:border-cyan-500/40 text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>OFFICIAL BROADCAST RULE BOOKS • 11 SPORTS</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Space_Grotesk',sans-serif]">
                Global Sports Rule Books &amp; Scoring Regulations
              </h1>
            </div>
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rules, fouls, scoring..."
              className="w-full bg-[#060a14] border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Horizontal Sport Selection Category Capsule */}
        <div className="overflow-x-auto pb-3 mb-6 no-scrollbar">
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#051122]/90 border border-cyan-500/30 shadow-inner backdrop-blur-md">
            {filteredRules.map((sport) => {
              const isSelected = selectedSport === sport.id;
              return (
                <button
                  key={sport.id}
                  onClick={() => setSelectedSport(sport.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'border border-cyan-400 bg-cyan-950/70 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40 font-semibold'
                  }`}
                >
                  <span className="text-xs">{sport.icon}</span>
                  <span>{sport.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Sport Rule Details Card */}
        <div className="bg-gradient-to-br from-[#0d1527]/90 via-[#0a1120]/90 to-[#060a14]/90 border border-slate-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          {/* Header Banner */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-3xl shadow-lg">
                {currentRule.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-black text-white font-['Space_Grotesk',sans-serif]">
                    {currentRule.name}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${currentRule.badgeColor}`}>
                    {currentRule.governingBody}
                  </span>
                </div>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {currentRule.summary}
                </p>
              </div>
            </div>

            {onNavigateToConsole && (
              <button
                onClick={() => onNavigateToConsole(currentRule.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Open {currentRule.name} Console</span>
              </button>
            )}
          </div>

          {/* Core Match Info Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-800">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#070b14]/80 border border-slate-800/80">
              <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Match Duration &amp; Periods</div>
                <div className="text-xs font-bold text-slate-100">{currentRule.duration}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#070b14]/80 border border-slate-800/80">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Team Size &amp; Composition</div>
                <div className="text-xs font-bold text-slate-100">{currentRule.teamSize}</div>
              </div>
            </div>
          </div>

          {/* 3-Column Content Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
            {/* Column 1: Scoring Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-cyan-400 font-mono">
                <Award className="w-4 h-4" />
                <span>Official Scoring Matrix</span>
              </div>
              <div className="space-y-2.5">
                {currentRule.scoringBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#070b14]/70 border border-slate-800/80 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">{item.label}</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                        {item.points}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Key Gameplay Rules & Powerplays */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-400 font-mono">
                <Layers className="w-4 h-4" />
                <span>Key Game Logic &amp; Regulations</span>
              </div>
              <div className="space-y-2.5">
                {currentRule.keyRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#070b14]/70 border border-slate-800/80 hover:border-amber-500/30 transition-colors"
                  >
                    <div className="font-bold text-xs text-white mb-1 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{rule.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{rule.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Referee Signals & Broadcast Tips */}
            <div className="space-y-6">
              {/* Referee Signals */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-400 font-mono">
                  <Flag className="w-4 h-4" />
                  <span>Official Referee Signals</span>
                </div>
                <div className="space-y-2">
                  {currentRule.refereeSignals.map((sig, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#070b14]/70 border border-slate-800/80 flex items-start gap-2.5 text-[11px]"
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-200">{sig.signal}: </span>
                        <span className="text-slate-400">{sig.meaning}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Broadcast Graphics Tips */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-400 font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>OBS Broadcast Graphics Tips</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  {currentRule.broadcastTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-emerald-200">
                      <span className="text-emerald-400 font-bold">›</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
