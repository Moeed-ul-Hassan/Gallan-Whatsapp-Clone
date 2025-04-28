import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Volume2, BellRing, Monitor, PaintBucket, Globe, MessageSquare } from "lucide-react";
import { useTheme } from "next-themes";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Settings states
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(80);
  const [language, setLanguage] = useState("english");
  const [bubbleColor, setBubbleColor] = useState("#005c4b");
  const [enterToSend, setEnterToSend] = useState(true);
  
  // Make sure theme component only renders client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111b21] border-[#111b21] text-[#e9edef] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#e9edef]">Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="bg-[#202c33] text-[#8696a0]">
            <TabsTrigger value="appearance" className="data-[state=active]:text-[#00a884] data-[state=active]:bg-[#111b21]">
              <Monitor className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:text-[#00a884] data-[state=active]:bg-[#111b21]">
              <BellRing className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:text-[#00a884] data-[state=active]:bg-[#111b21]">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="language" className="data-[state=active]:text-[#00a884] data-[state=active]:bg-[#111b21]">
              <Globe className="h-4 w-4 mr-2" />
              Language
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="pt-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-[#202c33] rounded-full">
                    <PaintBucket className="h-5 w-5 text-[#00a884]" />
                  </div>
                  <div>
                    <h3 className="text-[#e9edef]">Theme</h3>
                    <p className="text-sm text-[#8696a0]">Choose your preferred theme</p>
                  </div>
                </div>
                <Select 
                  value={theme} 
                  onValueChange={(value) => setTheme(value)}
                >
                  <SelectTrigger className="w-32 bg-[#2a3942] border-[#2a3942] text-[#d1d7db]">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a3942] border-[#2a3942] text-[#d1d7db]">
                    <SelectItem value="dark" className="focus:bg-[#111b21] focus:text-[#00a884]">
                      <div className="flex items-center">
                        <Moon className="h-4 w-4 mr-2" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="light" className="focus:bg-[#111b21] focus:text-[#00a884]">
                      <div className="flex items-center">
                        <Sun className="h-4 w-4 mr-2" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system" className="focus:bg-[#111b21] focus:text-[#00a884]">
                      <div className="flex items-center">
                        <Monitor className="h-4 w-4 mr-2" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-[#202c33] rounded-full">
                    <MessageSquare className="h-5 w-5 text-[#00a884]" />
                  </div>
                  <div>
                    <h3 className="text-[#e9edef]">Chat Wallpaper</h3>
                    <p className="text-sm text-[#8696a0]">Change your chat background</p>
                  </div>
                </div>
                <Button className="bg-[#202c33] hover:bg-[#2a3942] text-[#d1d7db]">
                  Change
                </Button>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-[#e9edef]">Chat Bubble Color</h3>
                <div className="flex items-center space-x-3">
                  {["#005c4b", "#006a60", "#0b887d", "#128c7e", "#075e54"].map((color) => (
                    <div 
                      key={color}
                      className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 ${
                        bubbleColor === color ? 'ring-2 ring-[#00a884] scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setBubbleColor(color)}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#8696a0]">Choose the color for your sent messages</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="pt-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-[#202c33] rounded-full">
                    <BellRing className="h-5 w-5 text-[#00a884]" />
                  </div>
                  <div>
                    <h3 className="text-[#e9edef]">Message Notifications</h3>
                    <p className="text-sm text-[#8696a0]">Show notifications for new messages</p>
                  </div>
                </div>
                <Switch 
                  checked={notifications} 
                  onCheckedChange={setNotifications}
                  className="data-[state=checked]:bg-[#00a884]"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-[#202c33] rounded-full">
                    <Volume2 className="h-5 w-5 text-[#00a884]" />
                  </div>
                  <div>
                    <h3 className="text-[#e9edef]">Sounds</h3>
                    <p className="text-sm text-[#8696a0]">Play sounds for incoming messages</p>
                  </div>
                </div>
                <Switch 
                  checked={sounds} 
                  onCheckedChange={setSounds}
                  className="data-[state=checked]:bg-[#00a884]"
                />
              </div>
              
              {sounds && (
                <div className="space-y-3">
                  <Label htmlFor="volume" className="text-[#e9edef]">
                    Volume ({volumeLevel}%)
                  </Label>
                  <Slider
                    id="volume"
                    min={0}
                    max={100}
                    step={1}
                    value={[volumeLevel]}
                    onValueChange={(value) => setVolumeLevel(value[0])}
                    className="[&>[role=slider]]:bg-[#00a884]"
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="pt-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#e9edef]">Enter to Send</h3>
                  <p className="text-sm text-[#8696a0]">Press Enter to send messages</p>
                </div>
                <Switch 
                  checked={enterToSend} 
                  onCheckedChange={setEnterToSend}
                  className="data-[state=checked]:bg-[#00a884]"
                />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-[#e9edef]">Media Auto-Download</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch id="auto-images" className="data-[state=checked]:bg-[#00a884]" />
                    <Label htmlFor="auto-images" className="text-[#d1d7db]">Images</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="auto-audio" className="data-[state=checked]:bg-[#00a884]" />
                    <Label htmlFor="auto-audio" className="text-[#d1d7db]">Audio</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="auto-video" className="data-[state=checked]:bg-[#00a884]" />
                    <Label htmlFor="auto-video" className="text-[#d1d7db]">Videos</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="language" className="pt-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-[#202c33] rounded-full">
                    <Globe className="h-5 w-5 text-[#00a884]" />
                  </div>
                  <div>
                    <h3 className="text-[#e9edef]">App Language</h3>
                    <p className="text-sm text-[#8696a0]">Select your preferred language</p>
                  </div>
                </div>
                <Select 
                  value={language} 
                  onValueChange={setLanguage}
                >
                  <SelectTrigger className="w-32 bg-[#2a3942] border-[#2a3942] text-[#d1d7db]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a3942] border-[#2a3942] text-[#d1d7db]">
                    <SelectItem value="english" className="focus:bg-[#111b21] focus:text-[#00a884]">
                      English
                    </SelectItem>
                    <SelectItem value="spanish" className="focus:bg-[#111b21] focus:text-[#00a884]">
                      Español
                    </SelectItem>
                    <SelectItem value="french" className="focus:bg-[#111b21] focus:text-[#00a884]">
                      Français
                    </SelectItem>
                    <SelectItem value="german" className="focus:bg-[#111b21] focus:text-[#00a884]">
                      Deutsch
                    </SelectItem>
                    <SelectItem value="italian" className="focus:bg-[#111b21] focus:text-[#00a884]">
                      Italiano
                    </SelectItem>
                    <SelectItem value="portuguese" className="focus:bg-[#111b21] focus:text-[#00a884]">
                      Português
                    </SelectItem>
                    <SelectItem value="russian" className="focus:bg-[#111b21] focus:text-[#00a884]">
                      Русский
                    </SelectItem>
                    <SelectItem value="arabic" className="focus:bg-[#111b21] focus:text-[#00a884]">
                      العربية
                    </SelectItem>
                    <SelectItem value="hindi" className="focus:bg-[#111b21] focus:text-[#00a884]">
                      हिन्दी
                    </SelectItem>
                    <SelectItem value="chinese" className="focus:bg-[#111b21] focus:text-[#00a884]">
                      中文
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            className="bg-[#00a884] hover:bg-[#00a884]/90 text-white"
            onClick={() => onOpenChange(false)}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;