export default async function verifyWebsite(
  url: string,
  API: string,
  refExist: Ref<boolean | null>,
) {
  try {
    await $fetch<string>(`${API}/api/websites/verify`, {
      method: "POST",
      body: {
        url,
      },
    });
    refExist.value = true;
    return;
  } catch {
    refExist.value = false;
    return;
  }
}
