import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Users, Copyright, Ban, Server, XCircle, AlertCircle, RefreshCw, Package, Wifi, UserX, ShieldAlert, Scale } from "lucide-react";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-6 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Terms of Service</h1>
                <p className="text-muted-foreground">Last updated: November 20, 2025</p>
              </div>
            </div>
          </div>

          <Card className="mb-6 border-green-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                By accessing and using Pixivloader, you accept and agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use our service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 border-cyan-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-cyan-500" />
                </div>
                <CardTitle>2. Description of Service</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Pixivloader is a tool that allows users to archive publicly available artwork from Pixiv
                for personal use. Our service:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Downloads publicly accessible content from Pixiv</li>
                <li>Creates archives for personal backup purposes</li>
                <li>Stores download history for your convenience</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 border-blue-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle>3. User Responsibilities</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">You agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Use the service only for personal, non-commercial purposes</li>
                <li>Respect copyright and intellectual property rights of content creators</li>
                <li>Not redistribute, sell, or commercially exploit archived content</li>
                <li>Not use the service to violate any laws or regulations</li>
                <li>Not attempt to circumvent any security measures</li>
                <li>Not use automated tools to abuse the service</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 border-purple-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Copyright className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle>4. Intellectual Property</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All content archived through Pixivloader remains the property of its original creators.
                Pixivloader does not claim ownership of any archived content. Users are responsible for
                ensuring their use of archived content complies with applicable copyright laws and Pixiv's
                terms of service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 border-red-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Ban className="w-6 h-6 text-red-500" />
                </div>
                <CardTitle>5. Prohibited Uses</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">You may not:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Use the service for commercial purposes</li>
                <li>Redistribute archived content without permission</li>
                <li>Remove watermarks or attribution from archived content</li>
                <li>Use the service to harass or harm others</li>
                <li>Attempt to reverse engineer or modify the service</li>
                <li>Use the service in violation of Pixiv's terms of service</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6 border-green-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle>6. Service Availability</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We strive to maintain service availability but do not guarantee uninterrupted access.
                We reserve the right to modify, suspend, or discontinue the service at any time without
                notice. We are not liable for any service interruptions or data loss.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 border-red-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <UserX className="w-6 h-6 text-red-500" />
                </div>
                <CardTitle>7. Account Termination</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We reserve the right to terminate or suspend your account at our discretion if you violate
                these terms or engage in abusive behavior. You may delete your account at any time through
                the settings page.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 border-yellow-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                </div>
                <CardTitle>8. Disclaimer of Warranties</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT
                THE SERVICE WILL BE ERROR-FREE OR UNINTERRUPTED. USE OF THE SERVICE IS AT YOUR OWN RISK.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 border-orange-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-orange-500" />
                </div>
                <CardTitle>9. Limitation of Liability</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 border-indigo-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-indigo-500" />
                </div>
                <CardTitle>10. Changes to Terms</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We reserve the right to modify these terms at any time. Continued use of the service after
                changes constitutes acceptance of the modified terms. We will notify users of significant
                changes via email or service notification.
              </p>
            </CardContent>
          </Card>


        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
