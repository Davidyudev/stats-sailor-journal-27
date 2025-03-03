
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MT4Config } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MountTransition } from '@/components/ui/mt4-connector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
  const { toast } = useToast();
  
  // Mock initial MT4 config
  const [mt4Config, setMt4Config] = useState<MT4Config>({
    enabled: false,
    serverAddress: '',
    accountNumber: '',
    password: '',
    lastSync: null,
    autoSync: true,
    syncInterval: 30
  });

  const handleMT4ConfigChange = (key: keyof MT4Config, value: any) => {
    setMt4Config(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveMT4Config = () => {
    // Here would be the logic to save the MT4 configuration
    toast({
      title: "Settings saved",
      description: "Your MT4 connection settings have been updated.",
    });
  };

  const handleTestConnection = () => {
    // Here would be the logic to test the MT4 connection
    toast({
      title: "Connection test",
      description: "Testing connection to MT4...",
    });
    
    // Simulate a test connection response after 2 seconds
    setTimeout(() => {
      if (mt4Config.serverAddress && mt4Config.accountNumber && mt4Config.password) {
        toast({
          title: "Connection successful",
          description: "Successfully connected to MT4 server.",
          variant: "default",
        });
      } else {
        toast({
          title: "Connection failed",
          description: "Please check your MT4 credentials and try again.",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const handleClearData = () => {
    // Display a warning toast before clearing data
    toast({
      title: "Clear data",
      description: "This will remove all your trading data. Are you sure?",
      action: (
        <Button variant="destructive" size="sm" onClick={() => {
          // Here would be the logic to clear all trading data
          toast({
            title: "Data cleared",
            description: "All trading data has been removed from the application.",
          });
        }}>
          Confirm
        </Button>
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure your application and MetaTrader 4 connection.</p>
      </div>

      <Tabs defaultValue="mt4" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="mt4">MT4 Connection</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mt4" className="space-y-4">
          <MountTransition delay={100} className="fade-up">
            <Card>
              <CardHeader>
                <CardTitle>MetaTrader 4 Connection</CardTitle>
                <CardDescription>
                  Connect to your MT4 account to automatically import trading data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="mt4-enabled">Enable MT4 Connection</Label>
                    <p className="text-sm text-muted-foreground">
                      Turn on to automatically sync your trading data from MT4
                    </p>
                  </div>
                  <Switch
                    id="mt4-enabled"
                    checked={mt4Config.enabled}
                    onCheckedChange={(checked) => handleMT4ConfigChange('enabled', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="server-address">MT4 Server Address</Label>
                    <Input
                      id="server-address"
                      placeholder="e.g., demo.server.com:443"
                      value={mt4Config.serverAddress}
                      onChange={(e) => handleMT4ConfigChange('serverAddress', e.target.value)}
                      disabled={!mt4Config.enabled}
                    />
                  </div>
                  
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="account-number">Account Number</Label>
                      <Input
                        id="account-number"
                        placeholder="Your MT4 account number"
                        value={mt4Config.accountNumber}
                        onChange={(e) => handleMT4ConfigChange('accountNumber', e.target.value)}
                        disabled={!mt4Config.enabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Your MT4 password"
                        value={mt4Config.password}
                        onChange={(e) => handleMT4ConfigChange('password', e.target.value)}
                        disabled={!mt4Config.enabled}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-sync">Auto Synchronization</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync trades at regular intervals
                      </p>
                    </div>
                    <Switch
                      id="auto-sync"
                      checked={mt4Config.autoSync}
                      onCheckedChange={(checked) => handleMT4ConfigChange('autoSync', checked)}
                      disabled={!mt4Config.enabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sync-interval">Sync Interval (minutes)</Label>
                    <Select
                      disabled={!mt4Config.enabled || !mt4Config.autoSync}
                      value={mt4Config.syncInterval.toString()}
                      onValueChange={(value) => handleMT4ConfigChange('syncInterval', parseInt(value))}
                    >
                      <SelectTrigger id="sync-interval">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={!mt4Config.enabled}
                >
                  Test Connection
                </Button>
                <Button onClick={handleSaveMT4Config}>Save Changes</Button>
              </CardFooter>
            </Card>
          </MountTransition>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <MountTransition delay={100} className="fade-up">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select defaultValue="system">
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="MM/DD/YYYY">
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="UTC">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="NY">America/New_York</SelectItem>
                      <SelectItem value="LON">Europe/London</SelectItem>
                      <SelectItem value="SYD">Australia/Sydney</SelectItem>
                      <SelectItem value="TKY">Asia/Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </MountTransition>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <MountTransition delay={100} className="fade-up">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Name</Label>
                  <Input
                    id="account-name"
                    placeholder="Your name"
                    defaultValue="Trader"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account-email">Email</Label>
                  <Input
                    id="account-email"
                    type="email"
                    placeholder="Your email"
                    defaultValue="trader@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account-currency">Default Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger id="account-currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start space-y-4">
                <Button className="w-full">Update Account</Button>
                <Separator />
                <div className="text-sm text-muted-foreground mb-2 w-full">
                  <h4 className="font-medium text-foreground mb-1">Danger Zone</h4>
                  <p>These actions cannot be undone.</p>
                </div>
                <div className="flex w-full justify-between">
                  <Button
                    variant="outline"
                    onClick={handleClearData}
                  >
                    Clear All Data
                  </Button>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardFooter>
            </Card>
          </MountTransition>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
