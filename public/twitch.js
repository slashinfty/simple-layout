const { RefreshableAuthProvider, StaticAuthProvider } = require('twitch-auth');
const { ChatClient } = require('twitch-chat-client');
const timeoutQueue = require('timeout-queue');
const fs = require('fs');
const upath = require('upath');

const queue = timeoutQueue();

// Explanation: https://d-fischer.github.io/twitch-chat-client/docs/examples/basic-bot.html
const main = async () => {
    const tokens = JSON.parse(fs.readFileSync(upath.toUnix(upath.join(__dirname, 'tokens.json'))));
    const clientId = tokens.clientId;
    const clientSecret = tokens.clientSecret;
    const auth = new RefreshableAuthProvider(
        new StaticAuthProvider(clientId, tokens.accessToken),
        {
            clientSecret,
            refreshToken: tokens.refreshToken,
            expiry: tokens.expiryTimestamp === null ? null : new Date(tokens.expiryTimestamp),
            onRefresh: async({ accessToken, refreshToken, expiryDate }) => {
                const newTokens = {
                    clientId: clientId,
                    clientSecret: clientSecret,
                    accessToken,
                    refreshToken,
                    expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
                };
                fs.writeFileSync(upath.toUnix(upath.join(__dirname, 'tokens.json')), JSON.stringify(newTokens, null, 4), 'UTF-8');
            }
        }
    );
    // Which channel will be monitored
    const chatClient = new ChatClient(auth, { channels: ['dadinfinitum'] });
    await chatClient.connect();
    
    // Putting chat messages in queue
    chatClient.onMessage((channel, user, message) => {
        const chatMessage = document.createElement('p');
        chatMessage.innerHTML = '<span class="blue">' + user + '</span> <span class="twitch-message">' + message + '</span>';
        if (document.getElementById('twitchRadio').checked) queue.push(chatMessage);
    });
    
    // Putting host notifications in queue
    chatClient.onHosted((channel, user, auto, viewers) => {
        const hostMessage = document.createElement('p');
        hostMessage.innerHTML = '<span class="blue">' + user + '</span> <span class="twitch-message">is hosting with </span><span class="pink">' + viewers + '</span> <span class="twitch-message">viewers</span>';
        if (document.getElementById('twitchRadio').checked) queue.push(hostMessage);
    });
    
    // Putting raid notifications in queue
    chatClient.onRaid((channel, user, raidInfo) => {
        const raidMessage = document.createElement('p');
        raidMessage.innerHTML = '<span class="blue">' + user + '</span> <span class="twitch-message">is raiding with </span><span class="pink">' + raidInfo.viewerCount + '</span> <span class="twitch-message">viewers</span>';
        if (document.getElementById('twitchRadio').checked) queue.push(raidMessage);
    });
    
    // Check queue every half second, but wait 6 seconds if posting a message
    // The 6 seconds is equal to the length of the fading animation
    const post = () => {
        let wait;
        if (queue.length > 0) {
            wait = 6000;
            document.getElementById('twitch').appendChild(queue.next());
        } else wait = 500;
        setTimeout(post, wait);
    }
    
    post();
}

main();