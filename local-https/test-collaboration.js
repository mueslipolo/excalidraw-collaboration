// Simple test to verify crypto.subtle is available
console.log('Testing Web Crypto API availability...');

if (window.crypto && window.crypto.subtle) {
    console.log('✅ crypto.subtle is available - collaboration should work!');
    
    // Test key generation (same as Excalidraw uses)
    window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        false,
        ["encrypt", "decrypt"]
    ).then(() => {
        console.log('✅ AES key generation successful - encryption ready!');
    }).catch(err => {
        console.error('❌ Key generation failed:', err);
    });
} else {
    console.log('❌ crypto.subtle is NOT available - HTTPS required for collaboration');
}

// Check if we're in a secure context
console.log('Secure context:', window.isSecureContext);
console.log('Location protocol:', window.location.protocol);