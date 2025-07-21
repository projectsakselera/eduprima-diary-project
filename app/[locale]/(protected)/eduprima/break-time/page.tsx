import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/components/navigation";
import { getAvailableGames, type Game } from "./games-config";

export default async function BreakTimePage() {
  const games = await getAvailableGames();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="bg-success/10 text-success px-2 py-1 rounded-full text-xs font-medium">Available</span>;
      case 'coming-soon':
        return <span className="bg-warning/10 text-warning px-2 py-1 rounded-full text-xs font-medium">Coming Soon</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <Icon icon="ph:coffee" className="h-12 w-12 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-default-900 mb-2">Break Time</h1>
          <p className="text-muted-foreground text-lg">
            Take a mindful break with our educational games designed for team relaxation
          </p>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {games.map((game) => (
          <Card key={game.id} className="group hover:shadow-lg transition-all duration-300 border-default-200">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-primary/10 group-hover:bg-primary/20 p-3 rounded-full transition-colors">
                  <Icon icon={game.icon} className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{game.title}</CardTitle>
                  {getStatusBadge(game.status)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                {game.description}
              </p>
              
              <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Icon icon="ph:clock" className="h-4 w-4" />
                  <span>{game.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon icon="ph:star" className="h-4 w-4" />
                  <span>{game.difficulty}</span>
                </div>
              </div>

              <div className="pt-2">
                {game.status === 'active' ? (
                  <Link href={`/eduprima/break-time/${game.id}`}>
                    <Button className="w-full" variant="default">
                      <Icon icon="ph:play" className="h-4 w-4 mr-2" />
                      Play Now
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    <Icon icon="ph:clock" className="h-4 w-4 mr-2" />
                    Coming Soon
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Section */}
      <Card className="max-w-3xl mx-auto bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Icon icon="ph:info" className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-default-900">Break Time Guidelines</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Games are designed for 10-15 minute breaks</li>
                <li>• Automatic pause when switching tabs to maintain focus</li>
                <li>• Progress is saved locally on your device</li>
                <li>• Perfect for team bonding during lunch breaks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 