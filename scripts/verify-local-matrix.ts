import sdk from 'matrix-js-sdk';
import { randomBytes } from 'crypto';

const HOMESERVER_URL = 'http://localhost:8008';
const USERNAME = `testuser_${randomBytes(4).toString('hex')}`;
const PASSWORD = 'supersecretpassword123';

async function verifyLocalMatrix() {
  console.log(`[1] Verifying Matrix backend at ${HOMESERVER_URL}...`);
  
  try {
    const response = await fetch(`${HOMESERVER_URL}/_matrix/client/versions`);
    if (!response.ok) throw new Error('Could not reach Matrix server');
    console.log('✅ Server is up and responding.\n');

    console.log(`[2] Registering a test user (${USERNAME})...`);
    
    // We can do a simple dummy registration since Synapse by default allows it,
    // or we can test dummy credentials. Synapse 'generate' script without specific tweaks
    // might block open registration. Let's try attempting it.
    
    // Create a temporary client just for this
    const client = sdk.createClient({ baseUrl: HOMESERVER_URL });
    
    try {
      await client.registerRequest({
        username: USERNAME,
        password: PASSWORD,
        auth: { type: 'm.login.dummy' }
      });
      console.log('✅ User registered successfully.\n');
    } catch (e: any) {
      if (e.errcode === 'M_FORBIDDEN' || e.message.includes('Registration has been disabled')) {
        console.warn('⚠️ Open registration is disabled on this Synapse server. This is normal for default configs, but you might need to enable `enable_registration: true` in your homeserver.yaml to test locally.');
        return;
      }
      throw e;
    }
    
    console.log(`[3] Logging in as ${USERNAME}...`);
    const loginResponse = await client.login('m.login.password', {
      user: USERNAME,
      password: PASSWORD
    });
    
    // Create an authenticated client
    const authClient = sdk.createClient({
      baseUrl: HOMESERVER_URL,
      accessToken: loginResponse.access_token,
      userId: loginResponse.user_id
    });
    
    authClient.startClient({ initialSyncLimit: 1 });
    
    await new Promise(resolve => authClient.once('sync', resolve));
    console.log('✅ Client connected and synced.\n');
    
    console.log(`[4] Creating a private test room...`);
    const room = await authClient.createRoom({
      preset: 'private_chat',
      name: 'SwarmCom Test Hub'
    });
    console.log(`✅ Room created with ID: ${room.room_id}\n`);
    
    console.log(`[5] Sending a test message...`);
    await authClient.sendTextMessage(room.room_id, 'Hello from SwarmCom local test suite!');
    console.log('✅ Message sent.\n');

    console.log('🎉 Verification Complete! The local Matrix server is fully functional and ready for SwarmCom adapter wiring.');
    authClient.stopClient();
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Verification Failed:', error.message || error);
    process.exit(1);
  }
}

verifyLocalMatrix();
