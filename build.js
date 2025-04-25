const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const adNetworks = [
    'development', 'adcolony', 'applovin', 'facebook', 'google', 'ironsource',
    'liftoff', 'mintegral', 'moloco', 'smadex', 'tencent', 'tiktok', 'unity', 'vungle'
];

const buildDir = path.join(__dirname, 'dist');
const templateDir = path.join(__dirname, 'src', 'index');

console.log('Current working directory:', process.cwd());
console.log('Template directory:', templateDir);

// Ensure the build directory exists
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Prompt user for project name prefix
rl.question('Enter the project name prefix: ', (prefix) => {
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
        path: path.resolve(__dirname, 'dist', '${prefix}_${network}'),
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
        const requiresInlining = ['facebook', 'google', 'moloco', 'smadex', 'tencent'].includes(network);

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

            // Copy config.json for tiktok network
            if (network === 'tiktok') {
                const configSrcPath = path.join(templateDir, 'tiktok', 'config.json');
                const configDestPath = path.join(buildDir, `${prefix}_tiktok`, 'config.json');
                if (fs.existsSync(configSrcPath)) {
                    fs.copyFileSync(configSrcPath, configDestPath);
                    console.log('config.json copied to build directory for tiktok.');
                } else {
                    console.warn('config.json not found for tiktok.');
                }
            }

            // Embed the compiled script into index.html for specified networks
            if (!requiresInlining) {
                const buildPath = path.join(buildDir, `${prefix}_${network}`);
                const indexPath = path.join(buildPath, 'index.html');
                const scriptPath = path.join(buildPath, 'playable.js');

                if (fs.existsSync(indexPath) && fs.existsSync(scriptPath)) {
                    let indexContent = fs.readFileSync(indexPath, 'utf8');
                    const scriptContent = fs.readFileSync(scriptPath, 'utf8');

                    // Replace the placeholder with the script content
                    indexContent = indexContent.replace('// P3 SCRIPT HERE', `${scriptContent}`);

                    // Write the modified index.html back to the build directory
                    fs.writeFileSync(indexPath, indexContent);

                    // Optionally, remove the standalone script file if no longer needed
                    fs.unlinkSync(scriptPath);

                    console.log(`Embedded script into index.html for ${network}.`);
                } else {
                    console.warn(`index.html or playable.js not found for ${network}.`);
                }
            }

            console.log(`Build for ${network} completed successfully.`);
        } catch (error) {
            console.error(`Error building for ${network}:`, error.message);
        }
    });

    console.log('All builds completed.');
    rl.close();
});
