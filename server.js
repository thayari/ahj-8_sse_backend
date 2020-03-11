const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const cors = require('koa2-cors');
const uuid = require('uuid');
const moment = require('moment');
const { streamEvents } = require('http-event-stream');

const app = new Koa();
const router = new Router();

const msgCount = 50;
const messages = [];

const actionMsg = {
  type: 'action',
  text: 'Идёт перемещение мяча по полю, игроки и той, и другой команды активно пытаются атаковать',
};
const freekickMsg = {
  type: 'freekick',
  text: 'Нарушение правил, будет штрафной удар',
};
const goalMsg = {
  type: 'goal',
  text: 'Отличный удар! И Г-О-Л!',
};

function randomMsg() {
  const rand = Math.floor(Math.random() * 101);
  if (rand <= 50) {
    return actionMsg;
  } if (rand <= 90) {
    return freekickMsg;
  }
  return goalMsg;
}

let i = 0;
const generateMessages = setInterval(() => {
  if (i < msgCount) {
    const messageData = randomMsg();
    moment.locale('ru');
    messageData.date = moment().format('DD MMMM YYYY, HH:mm:ss');
    const message = {
      event: 'message',
      data: JSON.stringify(messageData),
      id: uuid.v4(),
    };
    messages.push(message);
    i += 1;
  } else {
    clearInterval(generateMessages);
  }
}, 3000);


app.use(cors({
  origin: '*',
}));

app
  .use(router.routes())
  .use(router.allowedMethods());

router.get('/sse', async (ctx) => {
  streamEvents(ctx.req, ctx.res, {
    async fetch(lastEventId) {
      console.log(lastEventId);
      return [];
    },
    stream(sse) {
      let j = 0;
      const interval = setInterval(() => {
        if (messages.length > j) {
          sse.sendEvent(messages[j]);
          j += 1;
        }
      }, 4000);
      return () => clearInterval(interval);
    },
  });

  ctx.respond = false;
});

const port = process.env.PORT || 7070;
// eslint-disable-next-line no-unused-vars
const server = http.createServer(app.callback()).listen(port);
