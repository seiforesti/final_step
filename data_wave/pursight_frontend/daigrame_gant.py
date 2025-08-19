# Importation des modules nécessaires
from datetime import datetime
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib.cm as cm

# Mise à jour de la liste des tâches avec les nouvelles fonctionnalités décrites
updated_tasks = [
    ("Analyse des besoins & cadrage fonctionnel", "17/02/2025", "28/02/2025"),
    ("Connexion & extraction des schémas (MySQL, PostgreSQL, MongoDB)", "01/03/2025", "15/03/2025"),
    ("Développement du classificateur IA hybride", "16/03/2025", "10/04/2025"),
    ("Étiquetage automatique de sensibilité", "11/04/2025", "25/04/2025"),
    ("Traçabilité et lignage des données en temps réel", "26/04/2025", "10/05/2025"),
    ("Commentaires et tags IA pour clarté et compréhension", "11/05/2025", "25/05/2025"),
    ("Recherche contextuelle & insights auto-générés", "26/05/2025", "10/06/2025"),
    ("Assistant intelligent pour productivité & flux métier", "11/06/2025", "25/06/2025"),
    ("Développement frontend interactif", "26/06/2025", "20/07/2025"),
    ("Déploiement, documentation & optimisation IA/TCO", "21/07/2025", "17/08/2025")
]

# Conversion des dates
start_dates_updated = [datetime.strptime(t[1], "%d/%m/%Y") for t in updated_tasks]
end_dates_updated = [datetime.strptime(t[2], "%d/%m/%Y") for t in updated_tasks]
task_labels_updated = [t[0] for t in updated_tasks]

# Génération du diagramme
fig, ax = plt.subplots(figsize=(13, 6))
y_pos = range(len(updated_tasks))

# Génération d'une palette de couleurs
from matplotlib import colormaps
colors = colormaps.get_cmap('tab10')

for i, (start, end) in enumerate(zip(start_dates_updated, end_dates_updated)):
    ax.barh(i, (end - start).days, left=start, height=0.5, align='center', color=colors(i))

# Mise en forme
ax.set_yticks(y_pos)
ax.set_yticklabels(task_labels_updated)
ax.invert_yaxis()
ax.set_xlabel("Date")
ax.set_title("Diagramme de Gantt - Projet PFE 2025 at NXCI")

ax.xaxis.set_major_locator(mdates.MonthLocator())
ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %Y"))
plt.grid(True, axis='x', linestyle='--', alpha=0.6)
plt.tight_layout()

# Sauvegarde au format SVG
svg_corrected_path = "C:/Users/seifa/Downloads/diagramme_gantt_pfe_2025_corrige.svg"
plt.savefig(svg_corrected_path, format="svg")
plt.close()

svg_corrected_path
