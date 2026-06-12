# Waggora Unity SDK — Guide d'Intégration Complet

## Prérequis

- Unity 2021.3 LTS ou supérieur
- .NET Standard 2.1
- Compte studio Waggora (api.waggora.com)

---

## 1. Installation

### Via Unity Package Manager (recommandé)

1. Ouvrir **Window → Package Manager**
2. Cliquer **+** → **Add package from git URL**
3. Entrer : `https://github.com/waggora/unity-sdk.git#v1.0.0`

### Via manifest.json

```json
{
  "dependencies": {
    "com.waggora.sdk": "https://github.com/waggora/unity-sdk.git#v1.0.0",
    "com.unity.nuget.newtonsoft-json": "3.0.2"
  }
}
```

---

## 2. Configuration initiale

### 2.1 Créer un WaggoraConfig Asset

1. **Assets → Create → Waggora → Config**
2. Remplir :
   - **API Key** : `wag_live_xxxxxxxxxxxx` (depuis dashboard studio)
   - **Game ID** : `clx_game_xxxx` (depuis dashboard studio)
   - **Environment** : Production / Staging

### 2.2 Initialisation dans votre GameManager

```csharp
using Waggora;
using Waggora.Models;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    [SerializeField] private WaggoraConfig waggoraConfig;

    private async void Start()
    {
        // Initialiser le SDK une seule fois
        await WaggoraSDK.InitializeAsync(waggoraConfig);

        // Synchroniser le joueur (appeler à chaque session)
        await SyncPlayerWithWaggora();
    }

    private async Task SyncPlayerWithWaggora()
    {
        var result = await WaggoraSDK.SyncPlayerAsync(new PlayerSyncRequest
        {
            ExternalId = GetCurrentUserId(),      // votre ID joueur
            DisplayName = GetCurrentUsername(),    // pseudo joueur
            Level = GetCurrentPlayerLevel(),       // niveau dans votre jeu
            AvatarUrl = GetCurrentAvatarUrl()      // optionnel
        });

        if (result.IsNewPlayer)
        {
            // Afficher message de bienvenue + 100 jetons bonus
            ShowWelcomeMessage(result.Player.Wallet.Balance);
        }

        Debug.Log($"Waggora synced — Balance: {result.Player.Wallet.Balance} tokens");
    }
}
```

---

## 3. Afficher le menu Waggora

```csharp
using Waggora;

public class UIManager : MonoBehaviour
{
    // Assignez ce bouton dans l'Inspector
    [SerializeField] private Button waggoraButton;

    private void Awake()
    {
        waggoraButton.onClick.AddListener(OnWaggoraButtonClicked);
    }

    public void OnWaggoraButtonClicked()
    {
        // Mettre le jeu en pause
        Time.timeScale = 0;

        WaggoraSDK.ShowMenu(new WaggoraMenuOptions
        {
            // Personnalisation visuelle
            AccentColor = "#FF6B00",              // votre couleur de marque
            Theme = WaggoraTheme.Dark,
            ShowCloseButton = true,

            // Callbacks
            OnClose = () =>
            {
                Time.timeScale = 1;
                ResumeGame();
            },

            OnChallengeStarted = (challenge) =>
            {
                // Le joueur a créé un défi, lancer une partie
                StartGameSession(challenge.Id);
            }
        });
    }
}
```

---

## 4. Intégration du score

### 4.1 Cas simple — soumettre le score en fin de partie

```csharp
using Waggora;

public class GameSession : MonoBehaviour
{
    private string activeChallengeId;
    private float sessionStartTime;

    private void Start()
    {
        sessionStartTime = Time.realtimeSinceStartup;

        // Vérifier si une partie Waggora est en cours
        activeChallengeId = WaggoraSDK.GetActiveChallengeId();
    }

    // Appelé quand le joueur termine une partie
    public async void OnGameOver(int finalScore)
    {
        ShowGameOverUI(finalScore);

        // Si défi Waggora actif, soumettre le score
        if (activeChallengeId != null)
        {
            var result = await WaggoraSDK.SubmitScoreAsync(new ScoreSubmitRequest
            {
                ChallengeId = activeChallengeId,
                Score = finalScore,
                Metadata = new ScoreMetadata
                {
                    Duration = (int)(Time.realtimeSinceStartup - sessionStartTime),
                    Level = CurrentLevel,
                    Timestamp = DateTime.UtcNow
                }
            });

            if (result.IsComplete)
            {
                // Les deux joueurs ont soumis, résultat disponible
                ShowChallengeResult(result.ChallengeResult);
            }
            else
            {
                // En attente du score de l'adversaire (mode async)
                ShowWaitingForOpponent();
            }
        }
    }

    private void ShowChallengeResult(ChallengeResult result)
    {
        if (result.IsCurrentPlayerWinner)
        {
            UIManager.ShowVictory(result.WinnerPayout);
            // Déclencher animation confetti, son victoire, etc.
        }
        else if (result.Outcome == ChallengeOutcome.Draw)
        {
            UIManager.ShowDraw();
        }
        else
        {
            UIManager.ShowDefeat(result.WinnerPayout);
        }
    }
}
```

### 4.2 Anti-cheat — signature du score

```csharp
// Dans vos Player Settings → Waggora → Game Secret
// (jamais hardcodé dans le code, utilise un asset sécurisé)

public async void OnGameOver(int finalScore)
{
    if (activeChallengeId != null)
    {
        // Le SDK génère automatiquement la signature
        // à partir de votre Game Secret (défini dans WaggoraConfig)
        await WaggoraSDK.SubmitScoreAsync(new ScoreSubmitRequest
        {
            ChallengeId = activeChallengeId,
            Score = finalScore,
            SignScore = true,    // active la signature HMAC automatique
            Metadata = new ScoreMetadata { Duration = sessionDuration }
        });
    }
}
```

---

## 5. Événements et callbacks

```csharp
using Waggora;
using Waggora.Events;

public class WaggoraEventHandler : MonoBehaviour
{
    private void OnEnable()
    {
        // Résultat d'un défi
        WaggoraSDK.OnChallengeResult += HandleChallengeResult;

        // Solde de jetons mis à jour
        WaggoraSDK.OnTokenBalanceChanged += HandleTokenUpdate;

        // Défi reçu d'un adversaire (mode async)
        WaggoraSDK.OnChallengeReceived += HandleIncomingChallenge;

        // Notification générale
        WaggoraSDK.OnNotification += HandleNotification;
    }

    private void OnDisable()
    {
        WaggoraSDK.OnChallengeResult -= HandleChallengeResult;
        WaggoraSDK.OnTokenBalanceChanged -= HandleTokenUpdate;
        WaggoraSDK.OnChallengeReceived -= HandleIncomingChallenge;
        WaggoraSDK.OnNotification -= HandleNotification;
    }

    private void HandleChallengeResult(ChallengeResultEvent e)
    {
        Debug.Log($"Challenge {e.ChallengeId} completed. Winner: {e.WinnerId}");
        if (e.IsCurrentPlayerWinner)
        {
            AudioManager.PlayVictorySound();
            ParticleManager.SpawnConfetti();
        }
    }

    private void HandleTokenUpdate(TokenBalanceEvent e)
    {
        // Mettre à jour l'affichage du solde dans votre HUD
        HUD.UpdateTokenDisplay(e.NewBalance);

        if (e.Delta > 0)
            HUD.ShowTokenAnimation($"+{e.Delta} 💎");
    }

    private void HandleIncomingChallenge(ChallengeReceivedEvent e)
    {
        // Afficher notification "ShadowBlade99 vous défie !"
        UIManager.ShowChallengeNotification(e.ChallengerName, e.Stake);
    }

    private void HandleNotification(WaggoraNotification n)
    {
        UIManager.ShowToast(n.Title, n.Body);
    }
}
```

---

## 6. Référence complète de l'API SDK

```csharp
public static class WaggoraSDK
{
    // ── Initialisation ─────────────────────────────────────────

    /// <summary>Initialise le SDK. Appeler une seule fois au démarrage.</summary>
    static Task InitializeAsync(WaggoraConfig config);

    /// <summary>Synchronise/crée le joueur. Appeler à chaque session.</summary>
    static Task<PlayerSyncResult> SyncPlayerAsync(PlayerSyncRequest request);

    // ── UI ─────────────────────────────────────────────────────

    /// <summary>Affiche le menu Waggora complet.</summary>
    static void ShowMenu(WaggoraMenuOptions options = null);

    /// <summary>Affiche uniquement le wallet du joueur.</summary>
    static void ShowWallet();

    /// <summary>Affiche le classement.</summary>
    static void ShowLeaderboard(LeaderboardType type = LeaderboardType.Weekly);

    /// <summary>Affiche le marketplace.</summary>
    static void ShowMarketplace(ItemCategory? filterCategory = null);

    /// <summary>Affiche le résultat d'un défi spécifique.</summary>
    static void ShowChallengeResult(string challengeId);

    // ── Défis ──────────────────────────────────────────────────

    /// <summary>Crée un défi et entre en matchmaking.</summary>
    static Task<Challenge> CreateChallengeAsync(CreateChallengeRequest request);

    /// <summary>Retourne l'ID du défi actif, null si aucun.</summary>
    static string GetActiveChallengeId();

    /// <summary>Soumet le score du joueur pour un défi.</summary>
    static Task<ScoreSubmitResult> SubmitScoreAsync(ScoreSubmitRequest request);

    /// <summary>Annule un défi en attente et rembourse les jetons.</summary>
    static Task CancelChallengeAsync(string challengeId);

    // ── Wallet ─────────────────────────────────────────────────

    /// <summary>Retourne le solde actuel (depuis cache local).</summary>
    static int GetLocalBalance();

    /// <summary>Force la synchronisation du solde avec le serveur.</summary>
    static Task<Wallet> RefreshWalletAsync();

    // ── État ───────────────────────────────────────────────────

    static bool IsInitialized { get; }
    static bool IsPlayerSynced { get; }
    static string CurrentPlayerId { get; }

    // ── Événements ─────────────────────────────────────────────

    static event Action<ChallengeResultEvent>   OnChallengeResult;
    static event Action<TokenBalanceEvent>       OnTokenBalanceChanged;
    static event Action<ChallengeReceivedEvent>  OnChallengeReceived;
    static event Action<WaggoraNotification>     OnNotification;
    static event Action<string>                  OnError;
}
```

---

## 7. Personnalisation visuelle

```csharp
// Thème complet
WaggoraSDK.SetTheme(new WaggoraThemeConfig
{
    // Couleurs
    PrimaryColor   = "#FF6B00",    // boutons, accents
    SecondaryColor = "#1A1A2E",    // fond
    TextColor      = "#FFFFFF",
    SuccessColor   = "#00C851",
    ErrorColor     = "#FF4444",

    // Typographie
    FontFamily = "YourGameFont",   // doit être chargé dans Unity

    // Logo
    StudioLogoSprite = Resources.Load<Sprite>("WaggoraLogo"),

    // Langue
    Locale = "fr-FR",              // fr-FR, en-US, es-ES, de-DE, etc.
});
```

---

## 8. Intégration en 5 étapes — Checklist

```
□ Étape 1 — Ajouter le package via UPM
□ Étape 2 — Créer WaggoraConfig asset avec vos clés
□ Étape 3 — Appeler WaggoraSDK.InitializeAsync() au démarrage
□ Étape 4 — Appeler WaggoraSDK.SyncPlayerAsync() à chaque connexion joueur
□ Étape 5 — Ajouter bouton Waggora dans votre UI → ShowMenu()
□ Bonus   — Appeler SubmitScoreAsync() en fin de partie
```

**Temps d'intégration estimé : 2-8 heures selon complexité du jeu.**

---

## 9. Troubleshooting

| Problème | Solution |
|---------|---------|
| `WaggoraNotInitializedException` | Vérifiez que `InitializeAsync` est appelé avant toute autre méthode |
| Score non soumis | Vérifiez que `activeChallengeId` n'est pas null |
| Menu ne s'affiche pas | Vérifiez `Time.timeScale != 0` avant d'appeler `ShowMenu` |
| API Key invalide | Régénérez depuis dashboard.waggora.com → Settings → API Keys |
| Jetons non crédités | Vérifiez `SyncPlayerAsync` est appelé avec le bon `ExternalId` |

## Support

- Documentation : docs.waggora.com
- Support technique : dev@waggora.com
- Discord : discord.gg/waggora-dev
- GitHub Issues : github.com/waggora/unity-sdk/issues
