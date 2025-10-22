"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanApiService } from "@/utilities/PlanApiService";

const AuthTokenSetter = () => {
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSetToken = () => {
    if (token.trim()) {
      // Get existing User data or create new object
      const existingUser = localStorage.getItem("User");
      const userData = existingUser ? JSON.parse(existingUser) : {};
      
      // Update the token in the User object
      userData.token = token.trim();
      localStorage.setItem("User", JSON.stringify(userData));
      
      setIsAuthenticated(true);
      // Reload the page to refresh API calls
      window.location.reload();
    }
  };

  const handleClearToken = () => {
    // Get existing User data
    const existingUser = localStorage.getItem("User");
    if (existingUser) {
      const userData = JSON.parse(existingUser);
      delete userData.token;
      localStorage.setItem("User", JSON.stringify(userData));
    }
    
    setToken("");
    setIsAuthenticated(false);
    window.location.reload();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Authentication Token</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="token">Bearer Token</Label>
          <Input
            id="token"
            type="text"
            placeholder="Enter your Bearer token here..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSetToken} disabled={!token.trim()}>
            Set Token
          </Button>
          <Button onClick={handleClearToken} variant="outline">
            Clear Token
          </Button>
        </div>
        {isAuthenticated && (
          <div className="text-sm text-green-600">
            ✅ Token set successfully! API calls will now include authentication.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthTokenSetter;
