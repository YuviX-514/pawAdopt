import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function message(message: string, init?: ResponseInit) {
  return NextResponse.json({ success: true, message }, init);
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}
