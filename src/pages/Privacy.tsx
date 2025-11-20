import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-6 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Privacy Policy</h1>
                <p className="text-muted-foreground">Last updated: November 20, 2025</p>
              </div>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Pixivloader ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, and safeguard your information when you use our service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <p className="text-sm text-muted-foreground">
                  When you create an account, we collect your email address and authentication credentials
                  through Supabase. We do not store your passwords directly.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Usage Data</h3>
                <p className="text-sm text-muted-foreground">
                  We collect information about your downloads, including URLs you archive and download history.
                  This data is stored securely and used only to provide our service to you.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Technical Data</h3>
                <p className="text-sm text-muted-foreground">
                  We may collect IP addresses, browser type, and device information for security and
                  service improvement purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>To provide and maintain our archival service</li>
                <li>To manage your account and download history</li>
                <li>To improve and optimize our service</li>
                <li>To communicate with you about service updates</li>
                <li>To detect and prevent fraud or abuse</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We implement industry-standard security measures to protect your data. All data is encrypted
                in transit using HTTPS. Authentication is handled securely through Supabase with industry-standard
                encryption. However, no method of transmission over the internet is 100% secure.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Supabase:</strong> For authentication and database services</li>
                <li><strong>AWS:</strong> For hosting and infrastructure</li>
                <li><strong>Pixiv:</strong> As the source of archived content (we do not share your data with Pixiv)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of communications</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We retain your data for as long as your account is active. If you delete your account,
                we will delete your personal data within 30 days, except where we are required to retain
                it for legal purposes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at:
                <br />
                <a href="mailto:privacy@pixivloader.com" className="text-primary hover:underline">
                  privacy@pixivloader.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
