# Country Hunt

Country Hunt is a beginner-friendly word-search puzzle game made with HTML, CSS, and vanilla JavaScript.

## Open locally

1. Open this project folder in VS Code.
2. Open `index.html` directly in a browser, or install the **Live Server** VS Code extension.
3. With Live Server, right-click `index.html` and choose **Open with Live Server**.

## Play

- Click **Start Game**.
- Press and drag across letters in a horizontal, vertical, or diagonal line.
- You can drag forwards or backwards.
- Found words turn green and are crossed out in the country list.
- Every new country is worth 10 points.

## Run with Docker

Make sure Docker Desktop is running.

Build the image:

```powershell
docker build -t country-hunt .
```

Run the container on port 8080:

```powershell
docker run --name country-hunt-game -p 8080:80 country-hunt
```

Open <http://localhost:8080>.

Stop the container:

```powershell
docker stop country-hunt-game
```

Restart the stopped container:

```powershell
docker start country-hunt-game
```

Remove the container when you no longer need it:

```powershell
docker rm country-hunt-game
```

To run a new container after removal, use the `docker run` command again.

## Upload to GitHub

1. Create a new empty repository on GitHub.
2. In this project folder, run:

```powershell
git init
git add .
git commit -m "Create Country Hunt game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPOSITORY` with your GitHub details.

## Publish with GitHub Pages

1. Open your repository on GitHub.
2. Click **Settings**, then **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder.
5. Click **Save**.
6. Wait a minute or two, then open the public URL shown on the Pages page.
