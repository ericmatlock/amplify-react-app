describe("amplify song app", () => {
  it("should open a login page", () => {
    cy.visit("localhost:3000");
    cy.get("input[type=email]").should(
      "have.attr",
      "placeholder",
      "Enter your Email"
    );
    cy.get("input[type=password]").should(
      "have.attr",
      "placeholder",
      "Enter your Password"
    );
    cy.get("button[type=submit]").contains("Sign in");
  });
  beforeEach(() => {
    cy.login("eric.matlock@ampaworks.com", "testingpw");
  });
  it("the signed in user should be greeted by name and able to sign out", () => {
    cy.get("header").contains("Hello, Eric!");
    cy.get("button[type=button]").contains("Sign out").click();
    cy.get("input[type=email]").should(
      "have.attr",
      "placeholder",
      "Enter your Email"
    );
    cy.get("input[type=password]").should(
      "have.attr",
      "placeholder",
      "Enter your Password"
    );
    cy.get("button[type=submit]").contains("Sign in");
  });
  it("the signed in user should see a dashboard with listed songs", () => {
    cy.get(".songList").should("be.visible");
    cy.get("#song0").contains("Ain't No Love");
    cy.get("#song1").contains("Rec-Me");
  });
  it("each song should have a play button, title and artist, favorite button, and description", () => {
    cy.get("#song0").find("button[aria-label=play]").children("svg[data-testid=PlayArrowIcon]").should("be.visible");
    cy.get("#song0").find(".songTitle").should("be.visible");
    cy.get("#song0").find(".songOwner").should("be.visible");
    cy.get("#song0").find("button[aria-label=like]").children("svg[data-testid=FavoriteIcon]").should("be.visible");
    cy.get("#song0").find(".songDescriptionColumn").should("be.visible");
  });
  it("should be able to play and pause the song", () => {
    cy.get("#song0").find("button[aria-label=play]").click();
    cy.get("#song0").find("button[aria-label=play]").children("svg[data-testid=PauseIcon]").should("be.visible");
    cy.get("#song0").find(".ourAudioPlayer").should("be.visible");
    cy.get("#song0").find("button[aria-label=play]").click();
    cy.get("#song0").find(".ourAudioPlayer").should('not.exist');
  });
  it("should be able to add a like to a song", () => {
    cy.get("#song0").find(".favoriteColumn").children("p").invoke("text").then(Number)
    .then((n) => {
      cy.get("#song0").find("button[aria-label=like]").click();
      // check the incremented value
      cy.get("#song0").find(".favoriteColumn").contains("p", String(n + 1))
    })
  })
  it("should be able to add and delete songs in the list", () => {
    cy.get("button[aria-label=add-song]").should("be.visible");
    cy.get(".newSong").should("not.exist");
    cy.get("button[aria-label=add-song]").click();
    cy.get(".newSong").find("div[data-cy=new-title]").should("be.visible");
    cy.get(".newSong").find("div[data-cy=new-artist]").should("be.visible");
    cy.get(".newSong").find("div[data-cy=new-description]").should("be.visible");
    cy.get(".newSong").find("input[type=file]").should("be.visible");
    cy.get(".newSong").find("button[data-cy=upload-song]").should("be.visible").should("have.attr", "disabled");
    cy.get(".newSong").find("div[data-cy=new-title]").find("input[type=text]").type("Diggin' On a Groove");
    cy.get(".newSong").find("button[data-cy=upload-song]").should("be.visible").should("not.have.attr", "disabled");
    cy.get(".newSong").find("div[data-cy=new-artist]").find("input[type=text]").type("Jelly Bread");
    cy.get(".newSong").find("div[data-cy=new-description]").find("input[type=text]").type("From the Lessons Learned album")
    cy.get(".newSong").find("button[data-cy=upload-song]").click();
    cy.get(".songList").contains("Diggin' On a Groove").parentsUntil(".MuiPaper-root").find("button[aria-label=delete]").click();
    cy.get(".songList").should("not.contain", "Diggin' On a Groove");
  })

});
