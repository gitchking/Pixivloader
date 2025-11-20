import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Copyright, XCircle, Users, FileWarning, Info, UserCheck, ShieldAlert, Globe, RefreshCw } from "lucide-react";
import Footer from "@/components/Footer";

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-6 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Disclaimer</h1>
                <p className="text-muted-foreground">Last updated: November 20, 2025</p>
              </div>
            </div>
          </div>

          <Card className="mb-6 border-yellow-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Info className="w-6 h-6 text-yellow-500" />
                </div>
                <CardTitle>Important Notice</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Please read this disclaimer carefully before using Pixivloader. By using our service,
                you acknowledge and agree to the terms outlined below.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 border-blue-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle>Not Affiliated with Pixiv</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pixivloader is an independent tool and is NOT affiliated with, endorsed by, or connected
                to Pixiv Inc. in any way. Pixiv is a registered trademark of Pixiv Inc. We are not
                responsible for any issues arising from the use of Pixiv's platform.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 border-green-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle>Personal Use Only</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pixivloader is designed for personal archival purposes only. Users must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mt-3">
                <li>Use archived content for personal, non-commercial purposes</li>
                <li>Respect the intellectual property rights of content creators</li>
                <li>Comply with Pixiv's terms of service and copyright policies</li>
                <li>Not redistribute or commercially exploit archived content</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 border-purple-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Copyright className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle>Copyright and Intellectual Property</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All content archived through Pixivloader remains the intellectual property of its original
                creators. Pixivloader does not claim any ownership rights to archived content. Users are
                solely responsible for ensuring their use of archived content complies with applicable
                copyright laws and the rights of content creators.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 border-red-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <CardTitle>No Warranty</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pixivloader is provided "as is" without any warranties, express or implied. We do not
                guarantee:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mt-3">
                <li>Continuous or error-free service operation</li>
                <li>Accuracy or completeness of archived content</li>
                <li>Compatibility with future changes to Pixiv's platform</li>
                <li>Prevention of data loss or corruption</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 border-amber-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-500" />
                </div>
                <CardTitle>User Responsibility</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Users are solely responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mt-3">
                <li>Their use of the service and archived content</li>
                <li>Compliance with all applicable laws and regulations</li>
                <li>Respecting the rights of content creators</li>
                <li>Any consequences arising from misuse of the service</li>
                <li>Backing up important data independently</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 border-orange-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-orange-500" />
                </div>
                <CardTitle>Limitation of Liability</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                To the maximum extent permitted by law, Pixivloader and its operators shall not be liable
                for any direct, indirect, incidental, special, or consequential damages arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mt-3">
                <li>Use or inability to use the service</li>
                <li>Loss of data or content</li>
                <li>Service interruptions or errors</li>
                <li>Unauthorized access to your account</li>
                <li>Actions taken based on archived content</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 border-indigo-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-indigo-500" />
                </div>
                <CardTitle>Third-Party Content</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pixivloader archives content from third-party sources (Pixiv). We are not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mt-3">
                <li>The accuracy, legality, or appropriateness of third-party content</li>
                <li>Changes or removal of content by original creators</li>
                <li>Copyright infringement by content creators</li>
                <li>Content that violates laws or regulations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 border-cyan-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-cyan-500" />
                </div>
                <CardTitle>Service Changes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We reserve the right to modify, suspend, or discontinue the service at any time without
                prior notice. We are not liable for any modifications, suspensions, or discontinuations
                of the service.
              </p>
            </CardContent>
          </Card>


        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Disclaimer;
