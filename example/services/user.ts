const sleepAndResolve = (res: any = {}, time = 300) => new Promise<any>(resolve => setTimeout(() => resolve(res), time));

export const getUserById = async (id: string) => sleepAndResolve({ id });
export const updateUser = async (id: string, payload: any) => sleepAndResolve({ ...payload, id }, 1000);
