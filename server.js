const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);

io.on('connection', (socket) => {
  console.log('Un joueur connecté:', socket.id);
  const room = io.sockets.adapter.rooms.get('game1');
  const playerCount = room ? room.size : 0;
  const playerColor = playerCount === 0 ? 1 : 2;
  socket.join('game1');
  socket.emit('assignColor', playerColor);

  socket.on('move', (newBoard) => {
    socket.to('game1').emit('move', newBoard);
  });

  socket.on('disconnect', () => {
    console.log('Un joueur déconnecté:', socket.id);
  });
});

server.listen(3000, () => {
    console.log('Serveur prêt sur http://localhost:3000');
  });
});