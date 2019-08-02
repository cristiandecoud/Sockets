import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { UsuarioModel } from '../models/usuario.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public socketStatus = false;

  public usuario: UsuarioModel = null;

  constructor(
    private socket: Socket,
    private router: Router = null
  ) {
    this.cargarStorage();
    this.checkStatus();
  }

  checkStatus() {

    this.socket.on( 'connect', () => {
      console.log( 'Conectado al servidor' );
      this.socketStatus = true;
      this.cargarStorage();
    });

    this.socket.on( 'disconnect', () => {
      console.log( 'Deconectado del servidor' );
      this.socketStatus = false;
    });
  }


  emit( evento: string, payload?: any, callback?: Function ) {

    console.log( 'Emitiendo', evento );

    this.socket.emit( evento, payload, callback );
  }


  listen( evento: string ) {
    return this.socket.fromEvent( evento );
  }

  loginWS( nombre: string ) {

    return new Promise( ( resolve, reject ) => {

      this.emit( 'configurar-usuario', { nombre }, res => {

        this.usuario = new UsuarioModel( nombre );
        this.guardarStorage();

        resolve();

      });
    });
  }

  logoutWS() {
    this.usuario = null;
    localStorage.removeItem('usuario');
    const payload = {
      nombre: 'sin-nombre'
    };

    this.emit('configurar-usuario', payload , () => {} );
    this.router.navigateByUrl('');
  }

  getUsuario() {
    return this.usuario;
  }

  guardarStorage() {
    localStorage.setItem( 'usuario', JSON.stringify( this.usuario ) );
  }

  cargarStorage() {

    if ( localStorage.getItem( 'usuario' ) ) {
      this.usuario = JSON.parse( localStorage.getItem( 'usuario' ) );
      this.loginWS( this.usuario.nombre );
    }
  }
}
