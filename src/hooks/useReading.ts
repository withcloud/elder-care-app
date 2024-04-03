import {useEffect, useState} from 'react';

export default function useReading() {

  const domain = 'https://h01.app/';

  const getHealfData = async (api) => {
    const url = `${domain}${api}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // session: session.session,
        // 'session-sig': session.sessionSig,
      },
    });
    const result = await res.json();
    return result;
  };

  const uploadHealthData = async (api, data) => {
    console.log(data)
    const url = `${domain}${api}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // session: session.session,
        // 'session-sig': session.sessionSig,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return result;
  };

  const getSpO2 = async () => {
    const result = await getHealfData('api/trpc/spo2.list');
    return result;
  };

  const getBp = async () => {
    const result = await getHealfData('api/trpc/bp.list');
    return result;
  };

  const uploadSpO2 = async (data) => {
    const result = await uploadHealthData('api/trpc/spo2.create', data);
    return result;
  };

  const uploadBp = async (data) => {
    const result = await uploadHealthData('api/trpc/bp.create', data);
    return result;
  };

  return {
    getSpO2,
    getBp,
    uploadSpO2,
    uploadBp,
  };
}
