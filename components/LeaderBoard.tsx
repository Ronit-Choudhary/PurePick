import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/badge';
import { LeaderboardEntry } from '../types/gamification';
import { db } from '../lib/firebase';
import { Trophy, Medal, Award } from 'lucide-react';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      // In a real app, you'd query all user profiles and sort by points
      // For demo purposes, we'll create mock data
      const mockLeaderboard: LeaderboardEntry[] = [
        { userId: '1', userName: 'EcoChampion', totalPoints: 12500, level: 25, rank: 1 },
        { userId: '2', userName: 'GreenGuru', totalPoints: 9800, level: 20, rank: 2 },
        { userId: '3', userName: 'You', totalPoints: 8200, level: 17, rank: 3 },
        { userId: '4', userName: 'NatureNinja', totalPoints: 7100, level: 15, rank: 4 },
        { userId: '5', userName: 'EcoExplorer', totalPoints: 6500, level: 13, rank: 5 },
        { userId: '6', userName: 'PlanetProtector', totalPoints: 5800, level: 12, rank: 6 },
        { userId: '7', userName: 'GreenWarrior', totalPoints: 4900, level: 10, rank: 7 },
        { userId: '8', userName: 'EcoFriendly', totalPoints: 4200, level: 9, rank: 8 },
        { userId: '9', userName: 'SustainableLife', totalPoints: 3500, level: 7, rank: 9 },
        { userId: '10', userName: 'GreenLiving', totalPoints: 2800, level: 6, rank: 10 },
      ];

      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-white">🏆 Champion</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 text-white">🥈 Runner-up</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600 text-white">🥉 Third Place</Badge>;
    if (rank <= 10) return <Badge variant="secondary">Top 10</Badge>;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <span>Sustainability Leaderboard</span>
            </CardTitle>
            <p className="text-gray-600">Top eco-warriors making a difference</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((entry) => (
                <div 
                  key={entry.userId} 
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${
                    entry.rank <= 3 
                      ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{entry.userName}</div>
                      <div className="text-sm text-gray-500">Level {entry.level}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {entry.totalPoints.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">eco points</div>
                    {getRankBadge(entry.rank)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🌟 Weekly Reset</h4>
              <p className="text-sm text-blue-800">
                The leaderboard updates in real-time. Weekly points reset every Sunday at midnight. 
                Keep scanning sustainable products to climb the rankings!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}