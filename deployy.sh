#!/bin/bash

set -e

# Create deployment directory and subdirectories
mkdir -p deployment/public
mkdir -p deployment/.next/static
mkdir -p deployment/public/_next/static

# Copy the standalone output
cp -r build/standalone/* deployment/

# Copy static and public files
if [ -d "public" ]; then
    cp -r public/* deployment/public/
fi

if [ -d "build/static" ]; then
    cp -r build/static deployment/.next/
fi

if [ -d ".next/static" ]; then
    cp -r .next/static/* deployment/.next/static/
fi

# Copy static files for client-side
if [ -d "build/static" ]; then
    cp -r build/static deployment/public/_next/
fi

if [ -d ".next/static" ]; then
    cp -r .next/static/* deployment/public/_next/static/
fi

# Copy node_modules directory (uncomment if needed)
# cp -r node_modules deployment/node_modules

# Create startup.sh
echo -n "node server.js" > deployment/startup.sh
chmod +x deployment/startup.sh

# Create web.config
cat << 'EOF' > deployment/web.config
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        <rule name="API">
          <match url="^api/.*" />
          <action type="Rewrite" url="server.js" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
EOF

# Git commands (uncomment to enable)
# git add deployment/*
# git commit -m "Deploy to Azure"
# git push azure main:master
