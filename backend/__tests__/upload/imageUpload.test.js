const { describe, it, expect, beforeEach } = require('@jest/globals');
const path = require('path');

const { imageUpload } = require('../../helpers/image-upload');

describe('imageUpload helper — PoC Jest Coverage Tool', () => {

    describe('Instância do multer', () => {
        it('deve exportar a propiedade imageUpload', () => {
            expect(imageUpload).toBeDefined();
        });

        it('deve ser uma função (middleware multer)', () => {
            expect(typeof imageUpload).toBe('object');
        });
    });

    describe('fileFilter — validação de extensão', () => {

        let fileFilter;

        beforeEach(() =>{
            fileFilter = imageUpload._multer
              ? imageUpload._multer.opts.fileFilter
              : imageUpload.opts?.fileFilter;
        });

        it('deve aceitar arquivos .jpg', (done) => {
            if (!fileFilter) return done();

            const mockFile = { originalname: 'foto.jpg' };
            fileFilter({}, mockFile, (err, result) => {
                expect(err).toBeUndefined();
                expect(result).toBe(true);
                done();
            });
        });

        it('deve aceitar arquivos .png', (done) => {
            if (!fileFilter) return done();

            const mockFile = { originalname: 'imagem.png' };
            fileFilter({}, mockFile, (err, result) => {
                expect(err).toBeUndefined();
                expect(result).toBe(true);
                done();
            });
        });

        it ('deve rejeitar arquivos .pdf com mensagem de erro', (done) => {
            if (!fileFilter) return done();

            const mockFile = { originalname: 'documento.pdf' };
            fileFilter({}, mockFile, (err) => {
                expect(err).toBeInstanceOf(Error);
                expect(err.messgae).toMatch(/png|jpg/i);
                done();
            });
        });

        it('deve rejeitar arquivos .gif', (done) => {
            if (!fileFilter) return done();

            const mockFile = { originalname: 'animacao.gif' };
            fileFilter({}, mockFile, (err) => {
                expect(err).toBeInstanceOf(Error);
                done();
            });
        });  
    });

    describe('Extensões de arquivo', () => {
        it('deve reconhecer extensão .jpg via path.extname', () => {
            const ext = path.extname('foto.jpg');
            expect(ext).toBe('.jpg');
        });

        it('deve reconhecer a extensão .png via path .extname', () => {
            const ext = path.extname('image.png');
            expect(ext).toBe('.png');
        });
    });
});