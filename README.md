# KARE ACM SIGBED Website Clone

A replica of the KARE ACM SIGBED Student Chapter website (https://karesgbd.acm.org/).

## Project Structure

```
ACM SIGMED/
├── index.html              # Main homepage
├── recruitment.html        # Recruitment page
├── css/
│   ├── style.css          # Main stylesheet
│   └── recruitment.css    # Recruitment page styles
├── js/
│   ├── main.js            # Main JavaScript
│   └── recruitment.js     # Recruitment page JavaScript
├── images/
│   └── kare-acm-sigbed-logo.png  # Logo (add your own)
└── README.md              # This file
```

## Features

- **Responsive Design**: Works on all device sizes
- **Dark Mode**: Toggle between light and dark themes
- **Hero Slider**: Automatic image carousel
- **Announcement Ticker**: Scrolling announcements with pause functionality
- **News Slider**: Latest news and events carousel
- **Calendar**: Interactive calendar display
- **Testimonials**: Member testimonials carousel
- **Recruitment Form**: Complete application form with validation
- **Smooth Animations**: Scroll-triggered animations

## How to Run

1. Open `index.html` in a web browser
2. Or use a local server:
   - VS Code Live Server extension
   - `python -m http.server 8000`
   - `npx serve`

## Adding the Logo

Place your KARE ACM SIGBED logo in the `images/` folder with the name `kare-acm-sigbed-logo.png`.

## Technologies Used

- HTML5
- CSS3 (with CSS Variables for theming)
- JavaScript (ES6+)
- Font Awesome Icons
- Google Fonts (Poppins)

## External Resources

The website uses images from:
- KARE ACM SIGBED official website
- Kalasalingam Academy website
- Wikipedia (ACM Logo)

## Customization

### Colors
Edit CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #003366;
    --secondary-color: #0066cc;
    --accent-color: #ff6600;
    /* ... other variables */
}
```

### Content
- Edit `index.html` for main page content
- Edit `recruitment.html` for recruitment form

## Credits

- Original Website: KARE ACM SIGBED Student Chapter
- Kalasalingam Academy of Research and Education

## License

This is a replica for educational purposes only.
