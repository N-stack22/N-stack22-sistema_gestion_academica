describe('Chatbot público', () => {
  it('abre el chatbot y responde preguntas frecuentes', () => {
    cy.visit('/');
    cy.get('[data-cy="public-chatbot-toggle"]').should('be.visible').click();
    cy.get('[data-cy="public-chatbot-window"]').should('be.visible');

    cy.get('[data-cy="public-chatbot-quick-admission"]').click();
    cy.get('[data-cy="public-chatbot-messages"]').should('contain.text', 'proceso de admisión');

    cy.get('[data-cy="public-chatbot-input"]').type('horarios');
    cy.get('[data-cy="public-chatbot-send"]').click();
    cy.get('[data-cy="public-chatbot-messages"]').should('contain.text', 'lunes a viernes');
  });
});
