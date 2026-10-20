import { z } from 'zod';
export const bookingInput=z.object({kind:z.enum(['rental','repair','sale','test_drive']),vehicleId:z.string().max(100).optional(),serviceId:z.string().max(100).optional(),vehicleDetails:z.string().max(150).optional(),name:z.string().trim().min(2).max(100),email:z.email().max(150),phone:z.string().regex(/^\+?[0-9 ()-]{7,20}$/),startAt:z.iso.datetime(),endAt:z.iso.datetime().optional(),driver:z.boolean().default(false),delivery:z.enum(['office','delivery']).default('office'),paymentMethod:z.enum(['store','transfer']).default('store'),notes:z.string().max(1000).optional(),idempotencyKey:z.uuid()});
export function calculateQuote(input:any,vehicle:any,service:any){
 const start=new Date(input.startAt); let end=input.endAt?new Date(input.endAt):new Date(start.getTime()+(service?.duration||60)*60000);
 if(!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||end<=start)throw new Error('Selecciona fechas válidas.');
 if(start.getTime()<Date.now()-60000)throw new Error('La fecha debe estar en el futuro.');
 if(end.getTime()-start.getTime()>90*86400000)throw new Error('El máximo de alquiler es de 90 días.');
 let amount=0,deposit=0,days=0;
 if(input.kind==='rental') {if(!vehicle)throw new Error('Selecciona un vehículo.');days=Math.ceil((+end-+start)/86400000);amount=days*(vehicle.daily_rate+(input.driver?120000:0))+(input.delivery==='delivery'?60000:0);deposit=500000;}
 else if(input.kind==='repair'){if(!service)throw new Error('Selecciona un servicio.');amount=service.price;end=new Date(+start+service.duration*60000);}
 else if(input.kind==='sale'){if(!vehicle?.sale_price)throw new Error('Este vehículo no está en venta.');amount=2000000;deposit=amount;end=new Date(+start+86400000);}
 else {if(!vehicle?.sale_price)throw new Error('Selecciona un vehículo en venta.');end=new Date(+start+3600000);}
 return {amount,deposit,days,total:amount+(input.kind==='rental'?deposit:0),startAt:start.toISOString(),endAt:end.toISOString(),currency:'COP',paymentStatus:'pending'};
}
export const activeStatuses=['pending','confirmed','in_progress'];
export function validTransition(from:string,to:string){const transitions:Record<string,string[]>={pending:['confirmed','cancelled'],confirmed:['in_progress','completed','cancelled'],in_progress:['completed','cancelled'],completed:[],cancelled:[]};return transitions[from]?.includes(to)||false;}
