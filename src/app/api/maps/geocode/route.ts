import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { geocodeAddress } from '@/lib/maps/geocode'

export async function GET(request: Request){const user=await getCurrentUser(); if(!user)return new NextResponse('Unauthorized',{status:401}); const q=new URL(request.url).searchParams.get('q'); if(!q)return new NextResponse('Missing address',{status:400}); const result=await geocodeAddress(q); if(!result)return NextResponse.json({found:false}); return NextResponse.json({found:true,...result})}
