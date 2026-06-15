describe('Formulario de contacto', () => {
  beforeEach(() => {
    cy.visit('/contacto');
    cy.get('[data-cy="contact-form"]').should('be.visible');
  });

  it('muestra errores al enviar vacío', () => {
    cy.get('[data-cy="contact-submit"]').click();
    cy.get('[data-cy="contact-name"]').should('have.class', 'is-invalid');
    cy.get('[data-cy="contact-email"]').should('have.class', 'is-invalid');
  });

  it('muestra error con correo inválido', () => {
    cy.get('[data-cy="contact-name"]').type('María García');
    cy.get('[data-cy="contact-email"]').type('correo-invalido');
    cy.get('[data-cy="contact-phone"]').type('987654321');
    cy.get('[data-cy="contact-subject"]').type('Consulta admisión');
    cy.get('[data-cy="contact-message"]').type('Mensaje de prueba con más de diez caracteres.');
    cy.get('[data-cy="contact-submit"]').click();
    cy.get('[data-cy="contact-email"]').should('have.class', 'is-invalid');
  });

  it('muestra éxito con datos válidos', () => {
    cy.get('[data-cy="contact-name"]').type('María García');
    cy.get('[data-cy="contact-email"]').type('maria@ejemplo.com');
    cy.get('[data-cy="contact-phone"]').type('987654321');
    cy.get('[data-cy="contact-subject"]').type('Consulta admisión');
    cy.get('[data-cy="contact-message"]').type('Me gustaría recibir información sobre matrículas 2026.');
    cy.get('[data-cy="contact-submit"]').click();
    cy.get('[data-cy="contact-success"]').should('be.visible');
    cy.get('[data-cy="contact-success"]').should('contain.text', 'Mensaje enviado correctamente');
  });
});
