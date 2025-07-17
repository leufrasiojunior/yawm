import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as pty from 'node-pty';

@WebSocketGateway({ cors: true })
export class SteamGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SteamGateway.name);
  private terminal: pty.IPty | null = null;

  // ⬅ Novo método: apenas inicia o steamcmd sem login
  @SubscribeMessage('start-steamcmd')
  handleStartSteamCmd(@ConnectedSocket() client: Socket): void {
    if (this.terminal) {
      this.logger.warn('Terminal já está em execução.');
      client.emit('steam-output', 'Terminal já iniciado.');
      return;
    }

    this.logger.log('Iniciando steamcmd...');
    this.terminal = pty.spawn('/usr/games/steamcmd', [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.env.HOME,
      env: process.env,
    });

    this.terminal.onData((line) => {
      this.logger.debug(line);
      this.server.emit('steam-output', line);

      if (line.includes('Steam Guard code')) {
        this.server.emit('2fa-request');
      }

      if (line.includes('Success!')) {
        this.logger.log('Login bem-sucedido.');
        this.server.emit('login-success');
      }
    });

    this.terminal.onExit(({ exitCode }) => {
      this.logger.log(`Terminal finalizado com código ${exitCode}`);
      this.terminal = null;
    });
  }

  // ⬅ Envia comandos login e download
  @SubscribeMessage('start-download')
  handleStartDownload(@MessageBody() data: any): void {
    const { username, password, appId, workshopId } = data;

    if (!this.terminal) {
      this.logger.error('Terminal não iniciado.');
      return;
    }

    this.logger.log(`Enviando login para usuário: ${username}`);
    this.terminal.write(`login ${username} ${password}\r`);

    // Armazena temporariamente dados de download
    this.pendingDownload = { appId, workshopId };
  }

  private pendingDownload: { appId: string; workshopId: string } | null = null;

  @SubscribeMessage('send-2fa')
  handleSend2FA(@MessageBody() code: string): void {
    if (!this.terminal) return;
    this.logger.log(`Enviando código 2FA: ${code}`);
    this.terminal.write(`${code}\r`);

    // Aguarda sucesso e envia o download
    this.terminal.onData((line) => {
      if (line.includes('Success!') && this.pendingDownload) {
        const { appId, workshopId } = this.pendingDownload;
        this.logger.log('Efetuando download...');
        this.terminal?.write(`workshop_download_item ${appId} ${workshopId}\r`);
        this.pendingDownload = null;
      }
    });
  }
}
