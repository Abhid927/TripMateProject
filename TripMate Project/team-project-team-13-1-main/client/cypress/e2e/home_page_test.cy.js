describe('Home Page E2E Test', () => {
    it('should load the home page', () => {
      cy.visit('/');
      cy.contains('Welcome to Trip Planner');
    });
});