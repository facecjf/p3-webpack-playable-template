const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const adNetworks = [
    'adcolony', 'applovin', 'facebook', 'google', 'ironsource',
    'liftoff', 'mintegral', 'moloco', 'tencent', 'tiktok', 'unity', 'vungle', 'development'
];

const buildDir = path.join(__dirname, 'dist');
const templateDir = path.join(__dirname, 'src', 'index');

console.log('Current working directory:', process.cwd());
console.log('Template directory:', templateDir);

// Ensure the build directory exists
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

function createWebpackConfig(network, inline) {
    const templatePath = path.join(templateDir, network, 'index.html');
    
    console.log(`Checking for template file: ${templatePath}`);
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
    }

    const configContent = `
const path = require('path');
const webpack = require('webpack');
const CustomHtmlWebpackPlugin = require('./CustomHtmlWebpackPlugin');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        filename: "playable.js",
        path: path.resolve(__dirname, 'dist', '${network}'),
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    }
                }
            },
            {
                test: /\.(gif|png|jpe?g|svg|mp3|m4a|ogg|wav|json|xml)$/i,
                type: 'asset/inline'
            },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.env.AD_NETWORK': JSON.stringify('${network}')
        }),
        new CustomHtmlWebpackPlugin({
            template: '${templatePath.replace(/\\/g, '\\\\')}',
            filename: 'index.html'
        }),
    ]
};
`;

    return configContent;
}

adNetworks.forEach(network => {
    console.log(`Building for ${network}...`);

    // Determine if this network requires inlining
    const requiresInlining = ['facebook', 'moloco', 'tencent'].includes(network);

    try {
        // Create webpack config for this network
        const configContent = createWebpackConfig(network, requiresInlining);

        // Write the webpack config to a temporary file
        const tempConfigPath = path.join(__dirname, `webpack.${network}.config.js`);
        fs.writeFileSync(tempConfigPath, configContent);

        // Run the build command with the custom config
        execSync(`npx webpack --config ${tempConfigPath}`, { stdio: 'inherit', env: process.env });

        // Remove the temporary config file
        fs.unlinkSync(tempConfigPath);

        console.log(`Build for ${network} completed successfully.`);
    } catch (error) {
        console.error(`Error building for ${network}:`, error.message);
    }
});

console.log('All builds completed.');
