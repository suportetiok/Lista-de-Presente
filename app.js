{
  "rules": {
    "gifts": {
      ".read": true,
      ".write": "auth != null && (auth.uid === 'SEU_ID_EMAIL' || auth.uid === 'SEU_ID_GOOGLE')",
      ".validate": "newData.hasChildren(['name', 'price', 'icon', 'pixKey']) && 
                    newData.child('name').isString() && newData.child('name').val().length > 2 &&
                    newData.child('price').isString() && newData.child('price').val().length > 3 &&
                    newData.child('pixKey').isString() && newData.child('pixKey').val().length > 5"
    },
    "configuracoes": {
      ".read": true,
      ".write": "auth != null && (auth.uid === 'SEU_ID_EMAIL' || auth.uid === 'SEU_ID_GOOGLE')"
    },
    "logs": {
      ".read": "auth != null && (auth.uid === 'SEU_ID_EMAIL' || auth.uid === 'SEU_ID_GOOGLE')",
      ".write": "auth != null && (auth.uid === 'SEU_ID_EMAIL' || auth.uid === 'SEU_ID_GOOGLE')"
    }
  }
}
