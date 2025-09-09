describe('Expenses Function', () => {
    beforeEach(() => {
      cy.intercept('POST', '/api/getExpenses', {
        statusCode: 200,
        body: {
          express: JSON.stringify([
            {
              id: 1,
              exp_date: '2025-02-24T00:00:00Z',
              exp_name: 'Flight',
              u_id: 'user1',
              exp_amount: 500,
              currency_id: 'USD',
            },
            {
              id: 2,
              exp_date: '2025-02-25T00:00:00Z',
              exp_name: 'Hotel',
              u_id: 'user2',
              exp_amount: 300,
              currency_id: 'EUR',
            },
          ]),
        },
      }).as('getExpenses');
    });
  
    it('should fetch and display expenses', () => {
      cy.visit('/expenses'); // Adjust the URL as needed
      cy.wait('@getExpenses');
  
      cy.get('table').within(() => {
        cy.contains('th', 'Date');
        cy.contains('th', 'Name');
        cy.contains('th', 'User');
        cy.contains('th', 'Amount');
        cy.contains('th', 'Currency');
  
        cy.get('tbody tr').should('have.length', 2);
  
        cy.get('tbody tr').eq(0).within(() => {
          cy.contains('td', '2/24/2025');
          cy.contains('td', 'Flight');
          cy.contains('td', 'user1');
          cy.contains('td', '500');
          cy.contains('td', 'USD');
        });
  
        cy.get('tbody tr').eq(1).within(() => {
          cy.contains('td', '2/25/2025');
          cy.contains('td', 'Hotel');
          cy.contains('td', 'user2');
          cy.contains('td', '300');
          cy.contains('td', 'EUR');
        });
      });
    });
  
    it('should display an empty state when no expenses are found', () => {
      cy.intercept('POST', '/api/getExpenses', {
        statusCode: 200,
        body: { express: JSON.stringify([]) },
      }).as('getEmptyExpenses');
  
      cy.visit('/expenses'); // Adjust the URL as needed
      cy.wait('@getEmptyExpenses');
  
      cy.get('table').within(() => {
        cy.contains('No expenses found.');
      });
    });
  
    // Add more tests as needed
  });