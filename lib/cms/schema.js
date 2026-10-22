const statusOptions = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const toneOptions = [
  { value: "gold", label: "Gold" },
  { value: "charcoal", label: "Charcoal" },
  { value: "graphite", label: "Graphite" },
];

const speedOptions = [
  { value: "slow", label: "Slow" },
  { value: "normal", label: "Normal" },
  { value: "fast", label: "Fast" },
];

const linkFields = [
  { name: "label", label: "Label", type: "text", required: true },
  { name: "href", label: "Link", type: "text", required: true },
];

export const resourceSchemas = {
  categories: {
    key: "categories",
    collection: "categories",
    title: "Categories",
    singular: "Category",
    description: "Top-level shopping groups shown on the homepage and collections filter.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", required: true, source: "name" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "featured", label: "Featured on homepage", type: "boolean" },
      { name: "order", label: "Order", type: "number", default: 0 },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
        default: "draft",
      },
    ],
    listFields: [
      { name: "name", label: "Name" },
      { name: "slug", label: "Slug" },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "status" },
    ],
    defaults: {
      name: "",
      slug: "",
      description: "",
      featured: false,
      order: 0,
      status: "draft",
    },
    previewPath: "/collections",
  },
  collections: {
    key: "collections",
    collection: "collections",
    title: "Collections",
    singular: "Collection",
    description: "Editorial product groups with their own public pages.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", required: true, source: "name" },
      {
        name: "category",
        label: "Category",
        type: "reference",
        resource: "categories",
        required: true,
      },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "image",
        label: "Image path",
        type: "image",
        section: "collections",
      },
      { name: "featured", label: "Featured on homepage", type: "boolean" },
      { name: "order", label: "Order", type: "number", default: 0 },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
        default: "draft",
      },
    ],
    listFields: [
      { name: "name", label: "Name" },
      { name: "slug", label: "Slug" },
      { name: "category", label: "Category", resource: "categories" },
      { name: "order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "status" },
    ],
    defaults: {
      name: "",
      slug: "",
      category: "",
      description: "",
      image: "/placeholders/jeans-male.webp",
      featured: false,
      order: 0,
      status: "draft",
    },
    previewPath: "/collections",
    previewPattern: "/collections/{slug}",
  },
  products: {
    key: "products",
    collection: "products",
    title: "Products",
    singular: "Product",
    description: "Individual styles shown inside each collection carousel.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", required: true, source: "name" },
      {
        name: "category",
        label: "Category",
        type: "reference",
        resource: "categories",
        required: true,
      },
      {
        name: "collection",
        label: "Collection",
        type: "reference",
        resource: "collections",
        required: true,
      },
      { name: "image", label: "Image", type: "image", section: "products" },
      { name: "order", label: "Order", type: "number", default: 0 },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
        default: "draft",
      },
    ],
    listFields: [
      { name: "name", label: "Name" },
      { name: "slug", label: "Slug" },
      { name: "order", label: "Order", type: "number" },
      { name: "status", label: "Status", type: "status" },
    ],
    defaults: {
      name: "",
      slug: "",
      category: "",
      collection: "",
      image: "",
      order: 0,
      status: "draft",
    },
  },
  stores: {
    key: "stores",
    collection: "stores",
    title: "Stores",
    singular: "Store",
    description: "Branch pages, contact actions, opening hours and photos.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", required: true, source: "name" },
      { name: "address", label: "Address", type: "textarea", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "mapUrl", label: "Directions URL", type: "url" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "landline", label: "Landline", type: "text" },
      { name: "whatsapp", label: "WhatsApp", type: "text" },
      { name: "hours", label: "Opening hours", type: "text", required: true },
      { name: "photo", label: "Photo path", type: "image", section: "stores" },
      { name: "order", label: "Order", type: "number", default: 0 },
    ],
    listFields: [
      { name: "name", label: "Name" },
      { name: "slug", label: "Slug" },
      { name: "phone", label: "Phone" },
      { name: "hours", label: "Hours" },
      { name: "order", label: "Order", type: "number" },
    ],
    defaults: {
      name: "",
      slug: "",
      address: "",
      description: "",
      mapUrl: "",
      phone: "",
      landline: "",
      whatsapp: "",
      hours: "Mon – Sun · 10:00 AM – 9:00 PM",
      photo: "/branch-placeholder/hotmale-branch.webp",
      order: 0,
    },
    previewPath: "/stores",
    previewPattern: "/stores/{slug}",
  },
};

export const contentSchemas = {
  global: {
    key: "global",
    title: "Site details",
    description:
      "Brand identity, contact channels, social profiles, closing CTA, search metadata and interface labels.",
    fields: [
      {
        name: "brand",
        label: "Brand",
        type: "object",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "tagline", label: "Tagline", type: "text", required: true },
          { name: "city", label: "City", type: "text" },
          { name: "region", label: "Region", type: "text" },
          { name: "country", label: "Country", type: "text" },
          { name: "countryCode", label: "Country code", type: "text" },
          { name: "logo", label: "Logo path", type: "image", section: "brand" },
          { name: "wordmarkFallback", label: "Use wordmark fallback", type: "boolean" },
        ],
      },
      {
        name: "seo",
        label: "Search and social",
        type: "object",
        fields: [
          { name: "siteName", label: "Site name", type: "text" },
          { name: "siteUrl", label: "Production URL", type: "url" },
          { name: "titleTemplate", label: "Title template", type: "text" },
          { name: "defaultTitle", label: "Default title", type: "text" },
          { name: "defaultDescription", label: "Default description", type: "textarea" },
          {
            name: "defaultImage",
            label: "Social share image path",
            type: "image",
            section: "og",
          },
          { name: "defaultImageAlt", label: "Social share image alt", type: "text" },
          { name: "twitterHandle", label: "Twitter handle", type: "text" },
          { name: "locale", label: "Locale", type: "text" },
        ],
      },
      {
        name: "contact",
        label: "Direct contact",
        type: "object",
        fields: [
          { name: "phone", label: "Phone", type: "text" },
          { name: "whatsapp", label: "WhatsApp", type: "text" },
          { name: "email", label: "Email", type: "text" },
        ],
      },
      {
        name: "social",
        label: "Social",
        type: "object",
        fields: [
          { name: "instagramHandle", label: "Instagram handle", type: "text" },
          { name: "instagramUrl", label: "Instagram URL", type: "url" },
        ],
      },
      {
        name: "cta",
        label: "Closing call to action",
        type: "object",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "subtitle", label: "Subtitle", type: "textarea" },
          {
            name: "primaryCta",
            label: "Primary action",
            type: "object",
            fields: linkFields,
          },
          {
            name: "secondaryCta",
            label: "Secondary action",
            type: "object",
            fields: linkFields,
          },
        ],
      },
      {
        name: "ui",
        label: "Interface labels",
        type: "object",
        fields: [
          { name: "viewCollection", label: "View collection link", type: "text" },
          { name: "viewBranch", label: "View branch link", type: "text" },
          { name: "findStore", label: "Find store button", type: "text" },
          { name: "all", label: "All filter", type: "text" },
          { name: "whatsapp", label: "WhatsApp", type: "text" },
          { name: "openMenu", label: "Open menu", type: "text" },
          { name: "closeMenu", label: "Close menu", type: "text" },
          { name: "primaryNav", label: "Primary navigation label", type: "text" },
          { name: "mobileNav", label: "Mobile navigation label", type: "text" },
          { name: "backToTop", label: "Back to top", type: "text" },
          { name: "homeLabel", label: "Home link label", type: "text" },
          { name: "carouselPrev", label: "Carousel previous", type: "text" },
          { name: "carouselNext", label: "Carousel next", type: "text" },
          { name: "carouselRoleDescription", label: "Carousel description", type: "text" },
          { name: "collectionSingular", label: "Collection singular", type: "text" },
          { name: "collectionPlural", label: "Collection plural", type: "text" },
          { name: "categorySingular", label: "Category singular", type: "text" },
          { name: "categoryPlural", label: "Category plural", type: "text" },
          { name: "styleSingular", label: "Style singular", type: "text" },
          { name: "stylePlural", label: "Style plural", type: "text" },
          { name: "storeSingular", label: "Store singular", type: "text" },
          { name: "storePlural", label: "Store plural", type: "text" },
          { name: "otherStoresLabel", label: "Other stores label", type: "text" },
          { name: "landlineLabel", label: "Landline label", type: "text" },
          { name: "photoPending", label: "Pending photo note", type: "text" },
          { name: "addressLabel", label: "Address label", type: "text" },
          { name: "hoursLabel", label: "Hours label", type: "text" },
          { name: "cityLabel", label: "City label", type: "text" },
          { name: "stateLabel", label: "State label", type: "text" },
          { name: "establishedLabel", label: "Established label", type: "text" },
          { name: "establishedShortLabel", label: "Established short label", type: "text" },
          { name: "sinceLabel", label: "Since label", type: "text" },
          { name: "sizesLabel", label: "Sizes label", type: "text" },
          { name: "relatedLabel", label: "Related label", type: "text" },
          { name: "collectionLabel", label: "Collection label", type: "text" },
          { name: "enquireLabel", label: "Enquire label", type: "text" },
          { name: "whatsappLabel", label: "WhatsApp label", type: "text" },
          { name: "instagramLinkLabel", label: "Instagram link label", type: "text" },
          { name: "callLabel", label: "Call label", type: "text" },
          { name: "directionsLabel", label: "Directions label", type: "text" },
          { name: "availableAtLabel", label: "Available at label", type: "text" },
          { name: "allStoresLabel", label: "All stores label", type: "text" },
          { name: "storyLabel", label: "Story label", type: "text" },
          { name: "dismissLabel", label: "Toast dismiss label", type: "text" },
          { name: "phoneLabel", label: "Phone label", type: "text" },
          { name: "emailLabel", label: "Email label", type: "text" },
          { name: "visitLabel", label: "Visit label", type: "text" },
          { name: "notFoundTitle", label: "404 title", type: "text" },
          { name: "notFoundBody", label: "404 body", type: "textarea" },
          { name: "backHome", label: "404 home button", type: "text" },
          { name: "loaderTagline", label: "Loader tagline", type: "text" },
          { name: "loaderStatus", label: "Loader status", type: "text" },
        ],
      },
    ],
  },
  navigation: {
    key: "navigation",
    title: "Navigation & footer",
    description:
      "Header links, footer link groups and the announcement marquee. Every list can be reordered.",
    fields: [
      {
        name: "items",
        label: "Header navigation",
        type: "repeater",
        itemLabel: "Link",
        addLabel: "Add navigation link",
        fields: [
          ...linkFields,
          { name: "visible", label: "Visible", type: "boolean", default: true },
          { name: "order", label: "Order", type: "number", default: 0 },
        ],
      },
      {
        name: "footer",
        label: "Footer",
        type: "object",
        fields: [
          { name: "copyrightYear", label: "Copyright year", type: "number" },
          {
            name: "groups",
            label: "Footer groups",
            type: "repeater",
            itemLabel: "Group",
            addLabel: "Add footer group",
            fields: [
              { name: "title", label: "Title", type: "text", required: true },
              { name: "order", label: "Order", type: "number", default: 0 },
              {
                name: "links",
                label: "Links",
                type: "repeater",
                itemLabel: "Link",
                addLabel: "Add link",
                fields: linkFields,
              },
            ],
          },
        ],
      },
      {
        name: "announcements",
        label: "Announcement marquee",
        type: "repeater",
        itemLabel: "Announcement",
        addLabel: "Add announcement",
        fields: [
          { name: "message", label: "Message", type: "text", required: true },
          { name: "emoji", label: "Emoji", type: "text" },
          { name: "link", label: "Link", type: "text" },
          {
            name: "speed",
            label: "Speed",
            type: "select",
            options: speedOptions,
            default: "normal",
          },
          { name: "startsAt", label: "Starts at (ISO)", type: "text" },
          { name: "endsAt", label: "Ends at (ISO)", type: "text" },
          { name: "visible", label: "Visible", type: "boolean", default: false },
        ],
      },
    ],
  },
  homepage: {
    key: "homepage",
    title: "Homepage",
    description:
      "Hero posters, section order, offers, featured collections, store band and frequently asked questions.",
    fields: [
      {
        name: "hero",
        label: "Hero",
        type: "object",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "headline", label: "Headline", type: "text", required: true },
          { name: "subcopy", label: "Supporting copy", type: "textarea" },
          {
            name: "primaryCta",
            label: "Primary action",
            type: "object",
            fields: linkFields,
          },
          {
            name: "secondaryCta",
            label: "Secondary action",
            type: "object",
            fields: linkFields,
          },
          {
            name: "posters",
            label: "Campaign posters",
            type: "repeater",
            itemLabel: "Poster",
            addLabel: "Add poster",
            fields: [
              {
                name: "src",
                label: "Image path",
                type: "image",
                section: "hero",
                required: true,
              },
              { name: "alt", label: "Alt text", type: "text", required: true },
              {
                name: "position",
                label: "Position",
                type: "number",
                min: 1,
              },
            ],
          },
        ],
      },
      {
        name: "sections",
        label: "Section order",
        type: "repeater",
        itemLabel: "Section",
        addable: false,
        deletable: false,
        fields: [
          { name: "id", label: "Section", type: "readonly" },
          { name: "title", label: "Heading", type: "text" },
          { name: "linkLabel", label: "Link label", type: "text" },
          { name: "linkHref", label: "Link destination", type: "text" },
          { name: "enabled", label: "Enabled", type: "boolean" },
          { name: "order", label: "Order", type: "number" },
        ],
      },
      {
        name: "offers",
        label: "Offers",
        type: "repeater",
        itemLabel: "Offer",
        addLabel: "Add offer",
        fields: [
          { name: "label", label: "Eyebrow", type: "text", required: true },
          {
            name: "tone",
            label: "Tone",
            type: "select",
            options: toneOptions,
            default: "charcoal",
          },
          { name: "title", label: "Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
          {
            name: "stores",
            label: "Available at",
            type: "multiReference",
            resource: "stores",
            allOption: "all",
          },
          { name: "enabled", label: "Enabled", type: "boolean", default: true },
          { name: "order", label: "Position", type: "number", min: 1 },
        ],
      },
      {
        name: "featuredCollectionSlugs",
        label: "Featured collections",
        type: "multiReference",
        resource: "collections",
      },
      {
        name: "featuredCategorySlugs",
        label: "Featured categories",
        type: "multiReference",
        resource: "categories",
      },
      {
        name: "storesCta",
        label: "Store band",
        type: "object",
        fields: [
          { name: "title", label: "Title", type: "text" },
          { name: "headline", label: "Headline", type: "text" },
          { name: "ctaLabel", label: "Button label", type: "text" },
          { name: "ctaHref", label: "Button link", type: "text" },
          {
            name: "storeSlugs",
            label: "Branches shown",
            type: "multiReference",
            resource: "stores",
            allOption: "all",
          },
        ],
      },
      {
        name: "faq",
        label: "Frequently asked questions",
        type: "repeater",
        itemLabel: "Question",
        addLabel: "Add question",
        fields: [
          { name: "question", label: "Question", type: "text", required: true },
          { name: "answer", label: "Answer", type: "textarea", required: true },
          { name: "enabled", label: "Enabled", type: "boolean", default: true },
          { name: "order", label: "Position", type: "number", min: 1 },
        ],
      },
    ],
  },
};

export const pageSchemas = {
  collections: {
    key: "collections",
    path: "/collections",
    title: "Collections page",
    description: "The collections index header and empty state.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "intro", label: "Introduction", type: "textarea" },
      { name: "emptyState", label: "Empty collection message", type: "text" },
    ],
  },
  stores: {
    key: "stores",
    path: "/stores",
    title: "Stores page",
    description: "The stores index header.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "intro", label: "Introduction", type: "textarea" },
    ],
  },
  about: {
    key: "about",
    path: "/about",
    title: "About page",
    description: "Story, manifesto, timeline, values and community section.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "intro", label: "Introduction", type: "textarea" },
      { name: "since", label: "Established year", type: "text" },
      {
        name: "story",
        label: "Story",
        type: "object",
        fields: [
          { name: "title", label: "Story title", type: "text" },
          {
            name: "image",
            label: "Story image (empty uses the first branch photo)",
            type: "image",
            section: "pages",
          },
          { name: "imageCaption", label: "Image caption", type: "text" },
          { name: "imageAlt", label: "Image alt text", type: "text" },
          {
            name: "paragraphs",
            label: "Paragraphs",
            type: "list",
            itemType: "textarea",
            addLabel: "Add paragraph",
          },
          { name: "quote", label: "Quote", type: "textarea" },
          { name: "signature", label: "Signature", type: "text" },
        ],
      },
      {
        name: "manifesto",
        label: "Manifesto",
        type: "object",
        fields: [
          { name: "quote", label: "Quote", type: "textarea" },
          { name: "body", label: "Body", type: "textarea" },
        ],
      },
      { name: "timelineTitle", label: "Timeline heading", type: "text" },
      {
        name: "timeline",
        label: "Timeline",
        type: "repeater",
        itemLabel: "Milestone",
        addLabel: "Add milestone",
        fields: [
          { name: "year", label: "Year", type: "text", required: true },
          { name: "title", label: "Title", type: "text", required: true },
          { name: "body", label: "Body", type: "textarea" },
        ],
      },
      { name: "valuesTitle", label: "Values heading", type: "text" },
      {
        name: "values",
        label: "Values",
        type: "repeater",
        itemLabel: "Value",
        addLabel: "Add value",
        fields: [
          { name: "title", label: "Title", type: "text", required: true },
          { name: "body", label: "Body", type: "textarea" },
        ],
      },
      {
        name: "community",
        label: "Community",
        type: "object",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "body", label: "Body", type: "textarea" },
          { name: "ctaLabel", label: "Button label", type: "text" },
        ],
      },
    ],
  },
  privacy: {
    key: "privacy",
    path: "/privacy",
    title: "Privacy policy",
    description:
      "The policy header, last-updated date, introduction, numbered sections and contact note.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "updated", label: "Last updated", type: "text" },
      { name: "updatedLabel", label: "Last updated label", type: "text" },
      { name: "contentsLabel", label: "Sidebar heading", type: "text" },
      { name: "intro", label: "Introduction", type: "textarea" },
      {
        name: "sections",
        label: "Policy sections",
        type: "repeater",
        itemLabel: "Section",
        addLabel: "Add policy section",
        fields: [
          { name: "title", label: "Section heading", type: "text", required: true },
          {
            name: "body",
            label: "Section copy",
            type: "textarea",
            required: true,
            rows: 6,
          },
        ],
      },
      {
        name: "contact",
        label: "Contact note",
        type: "object",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "body", label: "Body", type: "textarea" },
          { name: "ctaLabel", label: "Button label", type: "text" },
          { name: "ctaHref", label: "Button link", type: "text" },
        ],
      },
    ],
  },
  contact: {
    key: "contact",
    path: "/contact",
    title: "Contact page",
    description:
      "Contact header, direct channels, store directory and enquiry form copy. The Web3Forms access key is managed in Account settings > Email delivery.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "intro", label: "Introduction", type: "textarea" },
      { name: "detailsTitle", label: "Direct channels heading", type: "text" },
      { name: "storesNote", label: "Stores note", type: "textarea" },
      {
        name: "form",
        label: "Enquiry form",
        type: "object",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "intro", label: "Introduction", type: "textarea" },
          {
            name: "fields",
            label: "Fields",
            type: "object",
            fields: [
              {
                name: "name",
                label: "Name field",
                type: "object",
                fields: [
                  { name: "label", label: "Label", type: "text" },
                  { name: "placeholder", label: "Placeholder", type: "text" },
                ],
              },
              {
                name: "email",
                label: "Email field",
                type: "object",
                fields: [
                  { name: "label", label: "Label", type: "text" },
                  { name: "placeholder", label: "Placeholder", type: "text" },
                ],
              },
              {
                name: "phone",
                label: "Phone field",
                type: "object",
                fields: [
                  { name: "label", label: "Label", type: "text" },
                  { name: "placeholder", label: "Placeholder", type: "text" },
                ],
              },
              {
                name: "message",
                label: "Message field",
                type: "object",
                fields: [
                  { name: "label", label: "Label", type: "text" },
                  { name: "placeholder", label: "Placeholder", type: "text" },
                ],
              },
            ],
          },
          { name: "submitLabel", label: "Submit button", type: "text" },
          { name: "submittingLabel", label: "Sending button", type: "text" },
          { name: "successTitle", label: "Success title", type: "text" },
          { name: "successMessage", label: "Success message", type: "textarea" },
          { name: "errorTitle", label: "Error title", type: "text" },
          { name: "errorMessage", label: "Error message", type: "textarea" },
          { name: "invalidTitle", label: "Validation title", type: "text" },
          { name: "invalidMessage", label: "Validation message", type: "textarea" },
          {
            name: "fieldErrors",
            label: "Field errors",
            type: "object",
            fields: [
              { name: "name", label: "Name error", type: "text" },
              { name: "email", label: "Email error", type: "text" },
              { name: "phone", label: "Phone error", type: "text" },
              { name: "message", label: "Message error", type: "text" },
            ],
          },
          { name: "note", label: "Privacy note", type: "textarea" },
        ],
      },
    ],
  },
};

export const pageList = Object.values(pageSchemas).map((schema) => ({
  key: schema.key,
  path: schema.path,
  title: schema.title,
  description: schema.description,
}));

export const resourceList = Object.values(resourceSchemas).map((schema) => ({
  key: schema.key,
  title: schema.title,
  singular: schema.singular,
  description: schema.description,
}));

export function getResourceSchema(key) {
  return resourceSchemas[key] ?? null;
}

export function getContentSchema(key) {
  return contentSchemas[key] ?? null;
}

export function getPageSchema(key) {
  return pageSchemas[key] ?? null;
}

export function defaultForField(field) {
  if (field.default !== undefined) return field.default;
  switch (field.type) {
    case "boolean":
      return false;
    case "number":
      return 0;
    case "list":
    case "repeater":
    case "multiReference":
      return [];
    case "object":
      return Object.fromEntries(
        (field.fields ?? []).map((child) => [child.name, defaultForField(child)]),
      );
    default:
      return "";
  }
}

export function emptyFromFields(fields = []) {
  return Object.fromEntries(
    fields.map((field) => [field.name, defaultForField(field)]),
  );
}
