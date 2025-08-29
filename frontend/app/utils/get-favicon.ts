export default async function getFavicon(
  url: string,
  iconRef: Ref<string | undefined>,
  API: string,
) {
  try {
    const newIcon = await $fetch<string>(`${API}/api/serp/favicon`, {
      method: "POST",
      body: {
        url,
      },
    });
    iconRef.value = newIcon;
  } catch {
    iconRef.value = "";
    return;
  }
}
