import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveView, isAdminView, safeReturnPath, viewPaths} from '../src/lib/routes.ts';
test('root is public and all legacy admin hashes retain their authorization boundary',()=>{
 assert.equal(resolveView('/'),'landing');
 assert.equal(resolveView('/','#website'),'website');
 for(const view of ['dashboard','bookings','customers','settings','repairs','sales','agents','messages','finances','rentals']){
  assert.equal(resolveView('/', '#'+view),view);assert.equal(resolveView(viewPaths[view]),view);assert.equal(isAdminView(view),true);
 }
 for(const view of ['landing','website','workshop','marketplace','portal','signin'])assert.equal(isAdminView(view),false);
});
test('authentication return paths reject external origins, protocol-relative URLs and unknown targets',()=>{
 assert.equal(safeReturnPath('/dashboard/clientes'),'/dashboard/clientes');
 for(const input of [null,'https://evil.example','//evil.example','/acceso','/dashboard?next=evil','/unknown'])assert.equal(safeReturnPath(input),'/mi-portal');
});
