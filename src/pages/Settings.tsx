
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

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
      description: "Your automatic update settings have been updated.",
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
        <p className="text-muted-foreground">Configure your application and automatic data updates.</p>
      </div>

      <Tabs defaultValue="mt4" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="mt4">Automatic Update</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mt4" className="space-y-4">
          <MountTransition delay={100} className="fade-up">
            <Card>
              <CardHeader>
                <CardTitle>Automatic Trading Data Updates</CardTitle>
                <CardDescription>
                  Configure how trading data is automatically imported into your journal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="mt4-enabled">Enable Automatic Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Turn on to automatically sync your trading data from exports
                    </p>
                  </div>
                  <Switch
                    id="mt4-enabled"
                    checked={mt4Config.enabled}
                    onCheckedChange={(checked) => handleMT4ConfigChange('enabled', checked)}
                  />
                </div>
                
                <Separator />
                
                <Alert className="bg-muted/50">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <h4 className="font-medium text-sm mb-1">Required CSV Format</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Your CSV files must have the following columns to be properly imported:
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="font-medium">Ticket</div>
                      <div>Unique trade ID</div>
                      <div className="font-medium">Symbol</div>
                      <div>Trading instrument (e.g., EURUSD)</div>
                      <div className="font-medium">Type</div>
                      <div>Buy or Sell</div>
                      <div className="font-medium">Open Time</div>
                      <div>Format: YYYY-MM-DD HH:MM:SS</div>
                      <div className="font-medium">Close Time</div>
                      <div>Format: YYYY-MM-DD HH:MM:SS</div>
                      <div className="font-medium">Volume</div>
                      <div>Trade size in lots</div>
                      <div className="font-medium">Open Price</div>
                      <div>Entry price</div>
                      <div className="font-medium">Close Price</div>
                      <div>Exit price</div>
                      <div className="font-medium">SL</div>
                      <div>Stop Loss price (optional)</div>
                      <div className="font-medium">TP</div>
                      <div>Take Profit price (optional)</div>
                      <div className="font-medium">Profit</div>
                      <div>Profit/Loss value</div>
                    </div>
                    <div className="text-xs mt-2">
                      <span className="font-medium">Example:</span> 123456,EURUSD,buy,2023-05-01 10:30:00,2023-05-01 14:45:00,0.1,1.1050,1.1075,1.1000,1.1100,25.00
                    </div>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="server-address">Export File Location</Label>
                    <Input
                      id="server-address"
                      placeholder="e.g., C:\MT4\MQL4\Files\Exports"
                      value={mt4Config.serverAddress}
                      onChange={(e) => handleMT4ConfigChange('serverAddress', e.target.value)}
                      disabled={!mt4Config.enabled}
                    />
                  </div>
                  
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="account-number">Account Name</Label>
                      <Input
                        id="account-number"
                        placeholder="Your trading account name"
                        value={mt4Config.accountNumber}
                        onChange={(e) => handleMT4ConfigChange('accountNumber', e.target.value)}
                        disabled={!mt4Config.enabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Export Password (if any)</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Password if your exports are encrypted"
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
                        Automatically check for new files at regular intervals
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
                    <Label htmlFor="sync-interval">Check Interval (minutes)</Label>
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
