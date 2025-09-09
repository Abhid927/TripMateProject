const callApiSendInvite = async (tripID, inviterID, invitedEmail) => {

    const frontendURL = window.location.origin;

    const response = await fetch("/api/invite/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripID, inviterID, invitedEmail, frontendURL })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to send invite.");
    }

    return data;
};

export default callApiSendInvite;
