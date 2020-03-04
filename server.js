const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');
const cors = require('koa2-cors');
const uuidv4 = require('uuid/v4');
const { streamEvents } = require('http-event-stream');

const app = new Koa();
const router = new Router({
  prefix: '/tickets'
});

app.use(koaBody({
  urlencoded: true,
  multipart: true,
}));

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
      const interval = setInterval(() => {
        sse.sendEvent({ data: 'hello world' });
      }, 5000);
      return () => clearInterval(interval);
    }
  });
});

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);
