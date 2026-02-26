export async function klaviyoUpsertProfile(profileData, listId, apiKey) {
    const headers = {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'revision': '2023-12-15'
    }

    if (profileData.attributes.phone_number) {
        let phone = String(profileData.attributes.phone_number).replace(/\s+/g, '')

        if (phone.startsWith('+')) {
            // Ya tiene formato, dejar igual
        } else if (phone.length === 10) {
            phone = '+52' + phone
        } else if (phone.length === 12 && phone.startsWith('52')) {
            phone = '+' + phone
        } else {
            // Inválido, omitir
            phone = null
        }

        if (phone) {
            profileData.attributes.phone_number = phone
        } else {
            delete profileData.attributes.phone_number
        }
    }

    let profileId = null

    // 1. Intentar crear
    const createRes = await fetch('https://a.klaviyo.com/api/profiles/', {
        method: 'POST',
        headers,
        body: JSON.stringify({ data: profileData })
    })

    if (createRes.ok) {
        const createJson = await createRes.json()
        profileId = createJson.data.id
    } else {
        const createJson = await createRes.json()

        // 2. Si es duplicado, actualizar con PATCH
        if (createRes.status === 409) {
            const existingId = createJson.errors?.[0]?.meta?.duplicate_profile_id
            if (existingId) {
                const patchRes = await fetch(`https://a.klaviyo.com/api/profiles/${existingId}/`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({
                        data: {
                            type: 'profile',
                            id: existingId,
                            attributes: profileData.attributes
                        }
                    })
                })

                if (patchRes.ok) {
                    profileId = existingId
                } else {
                    console.error('❌ Error en PATCH Klaviyo:', await patchRes.text())
                }
            }
        } else {
            console.error('❌ Error creando Klaviyo Profile:', JSON.stringify(createJson))
        }
    }

    if (!profileId) return

    // 3. Agregar a la lista
    const listRes = await fetch(`https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            data: [{ type: 'profile', id: profileId }]
        })
    })

    if (!listRes.ok) {
        console.error('❌ Error agregando a la lista Klaviyo:', await listRes.text())
    }
}
