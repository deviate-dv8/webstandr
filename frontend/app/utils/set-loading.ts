export default async function setLoading<TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => Promise<TResult> | TResult,
  loading: Ref<boolean>,
) {
  if (loading.value) return;
  loading.value = true;
  try {
    await callback(...([] as unknown as TArgs));
  } finally {
    loading.value = false;
  }
}
