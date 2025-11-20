import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";
import Footer from "@/components/Footer";

const DMCA = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-6 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">DMCA Policy</h1>
                <p className="text-muted-foreground">Digital Millennium Copyright Act Compliance</p>
              </div>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Copyright Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pixivloader respects the intellectual property rights of others and expects users to do
                the same. We respond to notices of alleged copyright infringement that comply with the
                Digital Millennium Copyright Act (DMCA) and other applicable intellectual property laws.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Our Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Pixivloader is a tool that allows users to archive publicly available content from Pixiv.
                Important points:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>We do not host or store user-archived content on our servers</li>
                <li>Archives are created and stored locally by individual users</li>
                <li>We do not control what content users choose to archive</li>
                <li>Users are responsible for their use of archived content</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filing a DMCA Notice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you believe your copyrighted work has been improperly archived or used through our
                service, you may submit a DMCA notice containing:
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">1. Identification of the copyrighted work</h4>
                  <p className="text-sm text-muted-foreground">
                    Describe the copyrighted work you claim has been infringed, or if multiple works,
                    a representative list.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">2. Identification of the infringing material</h4>
                  <p className="text-sm text-muted-foreground">
                    Provide the URL or other identifying information about where the material is located.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">3. Your contact information</h4>
                  <p className="text-sm text-muted-foreground">
                    Include your name, address, telephone number, and email address.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">4. Good faith statement</h4>
                  <p className="text-sm text-muted-foreground">
                    A statement that you have a good faith belief that the use is not authorized by the
                    copyright owner, its agent, or the law.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">5. Accuracy statement</h4>
                  <p className="text-sm text-muted-foreground">
                    A statement that the information in the notice is accurate, and under penalty of
                    perjury, that you are authorized to act on behalf of the copyright owner.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">6. Physical or electronic signature</h4>
                  <p className="text-sm text-muted-foreground">
                    Your physical or electronic signature.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Where to Send DMCA Notices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Send DMCA notices to our designated agent:
              </p>
              <div className="bg-secondary/50 p-4 rounded-lg space-y-1 text-sm">
                <p><strong>DMCA Agent</strong></p>
                <p>Pixivloader</p>
                <p>Email: <a href="mailto:dmca@pixivloader.com" className="text-primary hover:underline">dmca@pixivloader.com</a></p>
                <p>Subject Line: "DMCA Takedown Request"</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Counter-Notification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                If you believe your content was wrongly removed due to a DMCA notice, you may file a
                counter-notification containing:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Your physical or electronic signature</li>
                <li>Identification of the material that was removed</li>
                <li>A statement under penalty of perjury that you have a good faith belief the material
                    was removed by mistake or misidentification</li>
                <li>Your name, address, and telephone number</li>
                <li>A statement consenting to jurisdiction of the federal court in your district</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Repeat Infringers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We will terminate the accounts of users who are repeat infringers of copyright in
                appropriate circumstances.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>False Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Please note that under Section 512(f) of the DMCA, any person who knowingly materially
                misrepresents that material is infringing may be subject to liability. We may seek damages
                from any party that submits a notification or counter-notification in bad faith.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For questions about our DMCA policy, contact:
                <br />
                <a href="mailto:dmca@pixivloader.com" className="text-primary hover:underline">
                  dmca@pixivloader.com
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

export default DMCA;
