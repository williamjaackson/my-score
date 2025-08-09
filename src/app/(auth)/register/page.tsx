import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Register() {
  return (
    <div className="w-full flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Register with myScore
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5">
            <div className="flex gap-4">
              {/* First Name */}
              <div className="w-1/2 space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Enter your first name"
                  required
                />
              </div>
              {/* Last Name */}
              <div className="w-1/2 space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>
            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
