declare namespace Cypress {
  interface Chainable {
    loginAsAdmin(): Chainable<void>;
    loginAsTeacher(): Chainable<void>;
    loginAsParent(): Chainable<void>;
  }
}

Cypress.Commands.add('loginAsAdmin', () => {
  cy.clearLocalStorage();
  cy.visit('/login');
  cy.get('[data-cy="login-form"]').should('be.visible');
  cy.get('[data-cy="login-email"]').clear().type('admin@horizonte.edu.pe');
  cy.get('[data-cy="login-password"]').clear().type('Admin123');
  cy.get('[data-cy="login-submit"]').click();
  cy.url().should('include', '/admin/dashboard');
});

Cypress.Commands.add('loginAsTeacher', () => {
  cy.clearLocalStorage();
  cy.visit('/login');
  cy.get('[data-cy="login-form"]').should('be.visible');
  cy.get('[data-cy="login-email"]').clear().type('docente@horizonte.edu.pe');
  cy.get('[data-cy="login-password"]').clear().type('Docente123');
  cy.get('[data-cy="login-submit"]').click();
  cy.url().should('include', '/admin/dashboard');
});

Cypress.Commands.add('loginAsParent', () => {
  cy.clearLocalStorage();
  cy.visit('/login');
  cy.get('[data-cy="login-form"]').should('be.visible');
  cy.get('[data-cy="login-email"]').clear().type('padre@horizonte.edu.pe');
  cy.get('[data-cy="login-password"]').clear().type('Padre123');
  cy.get('[data-cy="login-submit"]').click();
  cy.url().should('include', '/admin/dashboard');
});

export {};
