/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
    {
      source: "/api/(.*)",
      headers: [
     { key: "Access-Control-Allow-Credentials", value: "true" },
     { key: "Access-Control-Allow-Origin", value: "*" },
     { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
     { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" }
    ]
    }
    ]
},

  webpack: (config) => {
    config.module.rules.push({
      test: /\.docx$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/files',
            outputPath: 'static/files',
            name: '[name].[ext]',
            esModule: false,
          },
        },
      ],
    });

    return config;
  },
  reactStrictMode: false,
}

module.exports = nextConfig
