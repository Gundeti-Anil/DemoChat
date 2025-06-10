import PusherServer from 'pusher'
import PusherClient from 'pusher-js'
import Pusher from 'pusher-js'

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: "ap2",
  useTLS: true,
});

export const pusherClient = new PusherClient(
  "e17365b77f027916db5d",
  {
    channelAuthorization: {
      endpoint: '/api/auth/pusher',
      transport: 'ajax',
    },
    cluster: 'ap2',
  }
);

export const pusher = new Pusher("e17365b77f027916db5d", {
  cluster: "ap2",
  authEndpoint: "/api/auth/pusher",
  auth: {
    headers: {
      "Content-Type": "application/json",
    }
  }
});