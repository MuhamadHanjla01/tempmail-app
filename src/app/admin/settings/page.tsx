
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Customization</CardTitle>
            <CardDescription>
              Customize the look and feel of your application. Changes will be
              applied globally.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color (HSL)</Label>
                <Input
                  id="primary-color"
                  placeholder="e.g., 262.1 83.3% 57.8%"
                  defaultValue="262.1 83.3% 57.8%"
                />
                <p className="text-xs text-muted-foreground">
                  Controls the main color for buttons, links, and highlights.
                  Use HSL format.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="background-color">Background Color (HSL)</Label>
                <Input
                  id="background-color"
                  placeholder="e.g., 224 71.4% 4.1%"
                   defaultValue="224 71.4% 4.1%"
                />
                 <p className="text-xs text-muted-foreground">
                  Controls the primary background color for the dark theme.
                  Use HSL format.
                </p>
              </div>
               <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color (HSL)</Label>
                <Input
                  id="accent-color"
                  placeholder="e.g., 215 27.9% 16.9%"
                   defaultValue="215 27.9% 16.9%"
                />
                 <p className="text-xs text-muted-foreground">
                  Controls the color for secondary elements like hover states and borders.
                  Use HSL format.
                </p>
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
